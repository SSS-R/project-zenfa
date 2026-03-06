# Security & Scalability Fix Plan — Project Zenfa

> Master plan to harden security and scale to 10k–30k concurrent users.  
> Created: March 7, 2026

---

## Phase 1 — Immediate Security Hardening (Day 1)

> Quick wins. No architecture changes. ~2 hours total.

### 1.1 Replace All Hardcoded Secrets

**Files:** `.env`, `backend/app/config.py`, `backend_b2c/app/config.py`

**What to do:**
- Generate real cryptographic secrets for **every** key:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- Replace in `.env`:
  ```env
  POSTGRES_PASSWORD=<64-char random hex>
  SECRET_KEY=<64-char random hex>
  B2C_SECRET_KEY=<64-char random hex>
  ```
- Remove hardcoded defaults from `config.py` — make them **required** (no default value), so the app crashes on startup if `.env` is missing a secret instead of silently using a weak default.
- Create a `.env.example` with placeholder values for new developers.

---

### 1.2 Disable Debug Mode by Default

**Files:** `backend/app/config.py`, `backend_b2c/app/config.py`

```diff
- debug: bool = True
+ debug: bool = False
```

Debug mode logs every SQL query (including user data) and outputs full stack traces to the client. Set to `True` only via `DEBUG=true` in `.env` for local dev.

---

### 1.3 Add Password Validation

**File:** `backend_b2c/app/api/schemas.py`

```python
from pydantic import field_validator

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    referral_code: Optional[str] = None

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v
```

---

### 1.4 Cap Pagination Limits

**Files:** All endpoints with `limit` parameters — `admin/users.py`, `admin/transactions.py`, `leaderboard.py`, `components.py`

```python
from fastapi import Query

def list_users(skip: int = Query(default=0, ge=0), limit: int = Query(default=20, ge=1, le=100), ...):
```

This prevents attackers from dumping entire tables with `?limit=999999`.

---

### 1.5 Remove Emails from Leaderboard

**File:** `backend_b2c/app/api/leaderboard.py`

Remove the `email` field entirely from `LeaderboardUser` and the response. Public endpoints should never expose email addresses, even masked ones.

```diff
  class LeaderboardUser(BaseModel):
      display_name: str | None
-     email: str
      total_referrals: int
```

---

### 1.6 Sanitize Search Input (SQL Wildcards)

**File:** `backend/app/api/endpoints/components.py`

```python
if search:
    safe_search = search.replace("%", r"\%").replace("_", r"\_")
    base_query = base_query.where(
        Component.name.ilike(f"%{safe_search}%", escape="\\")
    )
```

---

### 1.7 Lock Down Docker Ports

**File:** `docker-compose.yml`

```diff
  postgres:
    ports:
-     - "5432:5432"
+     - "127.0.0.1:5432:5432"

  redis:
    ports:
-     - "6379:6379"
+     - "127.0.0.1:6379:6379"
```

Add a Redis password:
```yaml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD}
```

---

### 1.8 Tighten CORS

**Files:** Both `main.py` files

```diff
  app.add_middleware(
      CORSMiddleware,
      allow_origins=[
          "http://localhost:3000",
          "http://127.0.0.1:3000",
+         # Add production domain when you deploy:
+         # "https://pclagbe.com",
      ],
      allow_credentials=True,
-     allow_methods=["*"],
-     allow_headers=["*"],
+     allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
+     allow_headers=["Authorization", "Content-Type"],
  )
```

---

## Phase 2 — Auth & Session Security (Day 2–3)

### 2.1 Reduce JWT Expiry + Add Refresh Tokens

**Current:** Access token lives 7 days. If stolen, full account takeover for a week.

**Target:**
| Token | Lifetime | Storage |
|---|---|---|
| Access Token | **30 minutes** | Memory / JS variable |
| Refresh Token | **7 days** | HTTP-only secure cookie |

**Implementation:**
1. Create a `RefreshToken` model in DB (token hash, user_id, expires_at, is_revoked)
2. On login → return access token in body + set refresh token as HTTP-only cookie
3. New endpoint `POST /auth/refresh` → validate refresh token cookie → issue new access token
4. New endpoint `POST /auth/logout` → revoke the refresh token in DB
5. Reduce `access_token_expire_minutes` to `30`

---

### 2.2 Add Rate Limiting

**Install:** `pip install slowapi`

**Apply to critical endpoints:**
| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 5 per minute per IP |
| `POST /auth/register` | 3 per minute per IP |
| `POST /payments/initiate` | 10 per minute per user |
| `POST /support/tickets` | 5 per minute per user |
| All other endpoints | 60 per minute per IP |

**Setup in `main.py`:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

---

### 2.3 Add Account Lockout

After 5 failed login attempts → lock the account for 15 minutes.

**Implementation:**
- Add `failed_login_attempts: int` and `locked_until: Optional[datetime]` fields to the `User` model
- On failed login → increment counter, lock at 5
- On successful login → reset counter
- On login attempt while locked → return "Account temporarily locked, try again in X minutes"

---

### 2.4 Add Input Sanitization Middleware

Add a global middleware that strips dangerous characters from all string inputs to prevent XSS if content is ever rendered:
- Strip `<script>` tags
- Escape HTML entities in user-provided text (display_name, ticket subject/messages, etc.)

---

## Phase 3 — Database & Performance (Day 4–5)

> This is where you go from ~500 users to ~10,000+ users.

### 3.1 Connection Pooling

**Files:** Both `database.py`

```python
engine = create_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=30,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
    echo=False,
)
```

| Setting | Value | Why |
|---|---|---|
| `pool_size` | 20 | 20 persistent connections ready to use |
| `max_overflow` | 30 | Extra 30 connections for traffic spikes (total burst = 50) |
| `pool_timeout` | 30s | How long to wait for a connection before erroring |
| `pool_recycle` | 1800s | Recycle connections every 30 min to avoid stale connections |
| `pool_pre_ping` | True | Verify connection is alive before handing it out |

---

### 3.1b Connection Pooling at Scale (PgBouncer)

**The Problem:** With SQLAlchemy pooling set to `pool_size=20` and `max_overflow=30` (50 connections per worker), scaling to 12 workers (3 replicas × 4 workers) could result in 600 simultaneous connections to PostgreSQL during a traffic spike. Basic managed Postgres tiers max out at 100-200 connections and will crash.

**The Fix:** You need a connection pooler like **PgBouncer**. If using Supabase or Neon, connect using their "Transaction Pooler" URL (usually on port 6543) instead of the direct database URL.

---

### 3.2 Multi-Worker Uvicorn

**File:** `docker-compose.yml`

```diff
- command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
+ command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

- Remove `--reload` (dev-only feature)
- `--workers 4` — each worker handles requests independently → 4× throughput
- Rule of thumb: `workers = (2 × CPU cores) + 1`

---

### 3.3 Redis Caching for Hot Endpoints

Cache frequently-hit, rarely-changing data:

| Endpoint | TTL | Why |
|---|---|---|
| `GET /components/` (list) | 5 min | Product data changes only when scrapers run |
| `GET /articles/headlines` | 5 min | Ticker data, changes every few hours |
| `GET /leaderboard/` | 10 min | Referral counts don't change fast |
| `GET /announcements/` | 15 min | Barely changes |

**Pattern:**
```python
import redis
import json

r = redis.from_url(settings.redis_url)

@router.get("/headlines")
async def get_headlines():
    cached = r.get("headlines")
    if cached:
        return json.loads(cached)
    
    # ... fetch from DB ...
    r.setex("headlines", 300, json.dumps(result))  # 5 min TTL
    return result
```

---

### 3.3b Edge Cache Invalidation (Next.js ISR)

**The Problem:** Caching endpoints like `GET /articles/headlines` in Redis for 5 minutes means a delay for "Breaking News."
**The Fix:** Implement **On-Demand Revalidation**. When an Admin publishes a new article (or a scraper finds one), your FastAPI backend sends a secret Webhook `POST` request to your Next.js application to instantly clear the cache for that specific page. This gives you indefinite caching with instant updates.

---

### 3.4 Database Indexing

Ensure these indexes exist (some may already be in your models):

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Components
CREATE INDEX idx_components_type ON components(component_type);
CREATE INDEX idx_components_brand ON components(brand);
CREATE INDEX idx_vendor_prices_in_stock ON vendor_prices(in_stock) WHERE in_stock = true;

-- Articles (when implemented)
CREATE INDEX idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX idx_articles_category_status ON articles(category, status);
```

---

## Phase 4 — Production Infrastructure (Week 2)

> This is the architecture that actually handles 10k–30k concurrent users.

### 4.1 Nginx Reverse Proxy + TLS

```
                   ┌──────────────────────┐
  Users ──HTTPS──▸ │   Nginx (port 443)   │
                   │   + Let's Encrypt TLS │
                   │   + Rate Limiting     │
                   │   + Gzip Compression  │
                   │   + Static File Cache │
                   └──────┬───────────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │ Backend  │ │ Backend  │ │ Backend  │
      │ Worker 1 │ │ Worker 2 │ │ Worker 3 │
      └──────────┘ └──────────┘ └──────────┘
```

**New file:** `nginx/nginx.conf`

```nginx
upstream backend_catalog {
    server backend:8000;
}

upstream backend_b2c {
    server backend_b2c:8001;
}

server {
    listen 443 ssl;
    server_name pclagbe.com;

    ssl_certificate /etc/letsencrypt/live/pclagbe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pclagbe.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Request size limit
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types application/json text/css application/javascript;

    location /api/main/ {
        proxy_pass http://backend_catalog/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/b2c/ {
        proxy_pass http://backend_b2c/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 4.1b Cloudflare WAF (DDoS Protection)

**The Problem:** Layer 7 DDoS attacks will still hit the server's CPU even with Nginx rate limiting. 
**The Fix:** Add **Cloudflare** in front of your Nginx proxy. Turn on "Bot Fight Mode" and aggressive WAF rules to drop malicious traffic at the edge network.

---

### 4.2 Horizontal Scaling with Docker Compose

```yaml
services:
  backend:
    deploy:
      replicas: 3  # 3 instances behind Nginx
    # ...

  backend_b2c:
    deploy:
      replicas: 3
    # ...
```

---

### 4.3 Managed Database (Production)

For 10k–30k users, move from self-hosted Postgres to a managed service:

| Provider | Cost | Why |
|---|---|---|
| **Supabase** (Free tier) | $0–$25/mo | Good for MVP, auto-backups |
| **Neon** | Free–$19/mo | Serverless Postgres, auto-scaling |
| **AWS RDS** | ~$15/mo | Industry standard, read replicas |
| **DigitalOcean Managed DB** | $15/mo | Simple, good for small teams |

Benefits: auto-backups, connection pooling (PgBouncer), monitoring, failover.

---

### 4.4 CDN for Frontend

Deploy Next.js to **Vercel** (free tier handles 10k+ users easily) or use **Cloudflare Pages**. This offloads all static assets from your server.

---

## Phase 5 — Async Migration (Week 3, If Needed)

> Only do this if Phase 3–4 isn't enough. This is the "go from 15k to 30k+" upgrade.

### 5.1 Switch to Async Database Sessions

**Install:** Replace `psycopg2-binary` with `asyncpg`

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
    pool_size=20,
    max_overflow=30,
)

async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with async_session() as session:
        yield session
```

**Then update all endpoints:**
```diff
- def list_users(..., db: Session = Depends(get_session)):
-     users = db.exec(statement).all()
+ async def list_users(..., db: AsyncSession = Depends(get_session)):
+     result = await db.execute(statement)
+     users = result.scalars().all()
```

This lets a single worker handle **thousands** of concurrent DB operations without blocking.

---

### 5.2 Isolate the Background Scheduler

**The Problem:** Running `APScheduler` inside the FastAPI `lifespan` handler with multiple workers (e.g., 12 workers) means all workers fire the scraper simultaneously, causing race conditions and API rate-limiting.
**The Fix:** Remove `APScheduler` from the FastAPI app. Create a separate, standalone Docker container (e.g., `news_worker`) that runs a single Python script just for schedule-based tasks. Let FastAPI *only* handle API requests.

---

### 5.3 WebSockets State Management (Redis Pub/Sub)

**The Problem:** Real-time features (like live updates to a leaderboard) won't work across multiple workers out-of-the-box.
**The Fix:** If adding WebSockets, integrate **Redis Pub/Sub** or **Socket.io with a Redis adapter** so workers can communicate with each other.

---

## Phase 6 — Ongoing Security Practices

### 6.1 Dependency Scanning

Pin exact versions in `requirements.txt` and run vulnerability scans:

```bash
pip install pip-audit
pip-audit -r requirements.txt
```

Set up GitHub Dependabot or Snyk to auto-flag vulnerable packages.

### 6.2 Security Headers Checklist

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Strict-Transport-Security` | `max-age=31536000` | Forces HTTPS |
| `Content-Security-Policy` | `default-src 'self'` | Prevents script injection |

### 6.3 Logging & Monitoring

- **Structured logging** — Use `structlog` or Python's `logging` with JSON format
- **Request tracing** — Add a unique `X-Request-ID` header to every response
- **Health dashboard** — Monitor with Grafana + Prometheus or UptimeRobot (free)
- **Error tracking** — Sentry (free tier) for real-time error alerts

### 6.4 Backup Strategy

| What | How Often | Where |
|---|---|---|
| PostgreSQL full dump | Daily | S3 / Google Cloud Storage |
| Redis snapshot | Hourly | Local + Cloud |
| `.env` + configs | On every change | Encrypted in password manager |

---

## Capacity Summary

```
Phase 1–2 (Security)    → Still ~500 users, but SAFE
Phase 3   (Performance)  → ~5,000–10,000 concurrent users + Instant Cache Invalidation & PgBouncer
Phase 4   (Infra)        → ~15,000–20,000 concurrent users + Cloudflare Edge Protection
Phase 5   (Async)        → ~30,000+ concurrent users + Isolated Worker Processes
Phase 6   (Ongoing)      → Staying secure as you grow
```

---

## Implementation Timeline

| Week | Phase | Effort |
|---|---|---|
| **Day 1** | Phase 1 (Quick security fixes) | ~2 hours |
| **Day 2–3** | Phase 2 (Auth hardening + rate limiting) | ~4–6 hours |
| **Day 4–5** | Phase 3 (DB pooling, caching, multi-worker) | ~4–6 hours |
| **Week 2** | Phase 4 (Nginx, TLS, horizontal scaling) | ~1 day |
| **Week 3** | Phase 5 (Async migration, only if needed) | ~2 days |
| **Ongoing** | Phase 6 (Monitoring, scanning, backups) | Continuous |
