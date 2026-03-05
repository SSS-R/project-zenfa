# PC Lagbe? (B2C) — Full Implementation Plan

Brief: Build the consumer-facing PC builder portal on top of the existing Zenfa catalog backend.  
The Zenfa AI engine is **stateless** — all user state, payments, sessions, admin, and support live in the new `backend_b2c` service and `zenfa_b2c` database.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                    frontend (Next.js)                  │
│  Consumer UI · Component Data · Admin · Support Portal │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTP
          ┌───────────────▼──────────────┐
          │        backend_b2c           │
          │  FastAPI · Port 8001         │
          │  Auth · Payments · Sessions  │
          │  Admin APIs · Support Tickets│
          └──┬──────────────────────┬───┘
             │                      │
  ┌──────────▼──┐          ┌────────▼──────────┐
  │  zenfa_b2c  │          │   zenfa_catalog    │
  │  PostgreSQL │          │  PostgreSQL (exist)│
  │  (NEW DB)   │          │  Components/Prices │
  └─────────────┘          └────────────────────┘
             │
         ┌───▼────┐
         │ Redis  │ ← guest sessions, tweak counters,
         │ (exist)│   rate limiting, support chat pubsub
         └────────┘
```

---

## Phase Plan

| Phase | What | Status |
|-------|------|--------|
| **1 — Core**    | DB schema + Auth + Guest mode + Builder UI + AI result | 🔄 In Progress (DB, Auth Done) |
| **2 — Money**   | Token packs + Deduction logic + Manual TrxID | 🔄 In Progress (API, Checkout Done) |
| **3 — Polish**  | Component swap modal + Budget warning + Build sharing | ⭕ Pending |
| **4 — Support** | Helpline tickets + Live chat + Admin panel | ⭕ Pending |
| **5 — Growth**  | PDF export + Social share image + Gamification | ⭕ Pending |

---

## 1 — Database Schema (`zenfa_b2c`)

New PostgreSQL database. **Completely separate from `zenfa_catalog`.**

### Tables

```sql
-- Consumer accounts
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,          -- null if Google/Facebook SSO
  google_id VARCHAR UNIQUE,
  role ENUM('user', 'admin', 'support') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  display_name VARCHAR,
  phone VARCHAR,                  -- for SMS helpline notifications
  token_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ
)

-- Purchased token/session packs
transactions (
  id UUID PRIMARY KEY,
  user_id UUID FK -> users,
  gateway ENUM('bkash', 'nagad', 'aamarpay', 'manual', 'free'),
  amount_bdt DECIMAL,
  package ENUM('starter', 'pro', 'enthusiast'),
  tokens_granted INTEGER,
  status ENUM('pending', 'success', 'failed', 'refunded'),
  gateway_trx_id VARCHAR,         -- Gateway transaction ID or User's input TrxID
  created_at TIMESTAMPTZ
)

-- A single build session tracking
sessions (
  id UUID PRIMARY KEY,
  user_id UUID FK -> users,       -- null for guest
  guest_token VARCHAR,            -- signed JWT for guests
  free_tweaks_remaining INTEGER DEFAULT 0, -- Based on purchased pack
  preferences JSONB,              -- budget, purpose, brand prefs
  current_build JSONB,            -- latest build snapshot from engine
  status ENUM('active', 'expired', 'completed'),
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)

-- Saved/shared builds (permanent record)
builds (
  id UUID PRIMARY KEY,
  session_id UUID FK -> sessions,
  user_id UUID FK -> users,       -- null for guest
  build_data JSONB,               -- full component list + scores
  total_price DECIMAL,
  share_slug VARCHAR UNIQUE,      -- for pclagbe.com/build/xyz123
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ
)

-- Support tickets
support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID FK -> users,       -- null for guests reporting issues
  subject VARCHAR NOT NULL,
  category ENUM('payment', 'build_issue', 'account', 'other'),
  status ENUM('open', 'in_progress', 'resolved', 'closed'),
  priority ENUM('low', 'normal', 'high', 'urgent'),
  created_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
)

-- Messages in a support ticket thread
support_messages (
  id UUID PRIMARY KEY,
  ticket_id UUID FK -> support_tickets,
  sender_id UUID FK -> users,     -- can be user or admin/support agent
  sender_role ENUM('user', 'support', 'admin'),
  message TEXT NOT NULL,
  attachments JSONB,              -- optional file URLs
  created_at TIMESTAMPTZ
)
```

---

## 2 — Backend Service (`backend_b2c/`)

New FastAPI service on **port 8001**. Uses the same Redis and PostgreSQL server but targets `zenfa_b2c` database.

### [NEW] `backend_b2c/` directory structure

```
backend_b2c/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── build.py
│   │   ├── transaction.py
│   │   └── support.py
│   ├── api/
│   │   ├── auth.py          (register, login, google-oauth, refresh)
│   │   ├── builder.py       (start session, submit prefs, tweak, save build)
│   │   ├── payments.py      (initiate, callback webhooks)
│   │   ├── builds.py        (get history, get shared build)
│   │   ├── support.py       (create ticket, reply, list tickets)
│   │   └── admin/
│   │       ├── users.py     (list, ban, adjust tokens)
│   │       ├── tickets.py   (assign, resolve tickets)
│   │       └── analytics.py (dashboard stats)
│   └── services/
│       ├── auth_service.py       (JWT, bcrypt, Google OAuth)
│       ├── engine_gateway.py     (calls Zenfa AI engine /internal/build)
│       ├── session_service.py    (Redis tweak counter, expiry)
│       ├── payment_service.py    (Gateway wrapper or manual verification logic)
│       └── notification_service.py (Brevo email integration + SMS alerts)
├── alembic/
└── requirements.txt
```

### Key API Endpoints

| Method | Endpoint | Who | Purpose |
|--------|----------|-----|---------|
| `POST` | `/auth/register` | Public | Email signup |
| `POST` | `/auth/login` | Public | Returns JWT |
| `GET`  | `/auth/google` | Public | Google OAuth redirect |
| `POST` | `/builder/start` | User/Guest | Start session, consumes 10 tokens |
| `POST` | `/builder/tweak` | User | Swap component, consumes 5 tokens (or free tweak) |
| `POST` | `/builder/save` | User | Persist and optionally share build |
| `GET`  | `/build/{slug}` | Public | View shared build |
| `POST` | `/payments/initiate` | User | Start payment or submit TrxID |
| `POST` | `/payments/callback` | Gateway | Webhook - update balance on success |
| `GET`  | `/support/tickets` | User | My tickets |
| `POST` | `/support/tickets` | User | Create new ticket |
| `POST` | `/support/tickets/{id}/reply` | User | Reply to ticket |
| `GET`  | `/admin/users` | Admin | User list + search |
| `PATCH`| `/admin/users/{id}` | Admin | Edit token balance, ban |
| `GET`  | `/admin/tickets` | Admin/Support | All support tickets |
| `PATCH`| `/admin/tickets/{id}` | Admin/Support | Assign, resolve, change priority |
| `GET`  | `/admin/analytics` | Admin | Revenue + usage dashboard data |

---

## 3 — Frontend (`frontend` — Existing Next.js App Router)

We will integrate the B2C portal seamlessly into your existing `frontend` directory. 
Auth will be handled via **NextAuth.js** (or standard JWT context) for Google SSO + JWT sessions.

### Page Structure

```text
frontend/src/app/
│
├── (public)/
│   ├── page.tsx              ← Existing landing page
│   ├── build/[slug]/page.tsx ← Shared build viewer (public)
│   └── pricing/page.tsx      ← Pricing page
│
├── build/                    ← Existing builder flow
│   ├── page.tsx              ← Preferences form
│   ├── loading/page.tsx      ← Magic loading screen
│   └── result/page.tsx       ← Result + component swap + save
│
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (dashboard)/              ← Protected, requires auth
│   ├── dashboard/page.tsx    ← Build history + token balance
│   ├── dashboard/tokens/page.tsx ← Buy token packs
│   └── support/
│       ├── page.tsx          ← My support tickets list
│       ├── new/page.tsx      ← Create new ticket
│       └── [id]/page.tsx     ← Ticket thread / chat view
│
└── (admin)/                  ← Protected, requires admin role
    ├── admin/page.tsx        ← Analytics dashboard
    ├── admin/users/page.tsx  ← User management
    ├── admin/tickets/page.tsx← Support tickets queue
    └── admin/announcements/page.tsx ← Broadcast notices
```

---

## 4 — Admin Panel Features

The admin panel is a **protected section of the same Next.js frontend** (not a separate app), guarded by `role === 'admin'` middleware. No need for a separate tool like Django Admin.

### Key Admin Capabilities

- **User Management:** Search users by email, view token balance, manually add/deduct tokens, ban/unban accounts
- **Support Queue:** See all open tickets sorted by priority, assign to support agents, reply as "support team", mark resolved
- **Payment Oversight:** See all transaction records, mark disputed payments as refunded
- **Analytics Dashboard:**
  - Total builds generated (daily/monthly chart)
  - Revenue from token sales
  - Most popular budget ranges and purposes
  - New user registrations over time
- **Announcements:** Post system-wide banners (e.g., "Maintenance scheduled at midnight")

---

## 5 — Helpline/Support System

> Users are paying money — they **must** have a clear, fast support path.

### 3-Tier Support Model

```
Tier 1 — Self Service (no staff needed)
  → FAQ page covering common issues (payment failed, build didn't save)
  → Automated email on payment failure with retry instructions

Tier 2 — Ticket System (async, 24h response target)
  → User submits ticket from dashboard
  → Admin/support agent replies in the ticket thread (like a forum)
  → User gets email notification on each reply (via notification_service.py)
  → Priority levels: low / normal / high (payment issues) / urgent

Tier 3 — Direct Contact (for urgent escalations)
  → Phone/WhatsApp number in footer for payment disputes
  → Admin can flag ticket as "refund initiated"
```

### Automated Notifications (via `notification_service.py`)

| Event | Channel |
|---|---|
| Account Creation | Email |
| Payment success | Email + optional SMS |
| Payment failed | Email with retry link |
| Token balance low (≤1) | Email reminder to top up |
| Support reply received | Email notification |
| Build shared (someone views your build) | Optional email |
| PC Build Copy/Export | Email |

Email via **Brevo** (formerly Sendinblue - great free tier, perfect for transactionals).  
SMS via **Bangladesh SMS gateway** (e.g., BulkSMSBD) for payment alerts.

---

## 6 — Payment Gateway Alternatives (No SSLCommerz)

Since SSLCommerz has high setup fees, here are the three realistic alternatives for your MVP:

### Option A: aamarPay (Recommended for Startups)
- **Why:** Very low setup fee (often free or around 1,000-2,000 BDT for startups), fast onboarding, and gives you bKash, Nagad, Upay, and Cards over a single API.
- **Implementation:** Similar to SSLCommerz. We direct the user to their checkout page, and they send a webhook callback to our `/payments/callback` route.

### Option B: ShurjoPay or PortWallet
- **Why:** Good alternatives to aamarPay with competitive rates depending on your negotiation. Same technical flow.

### Option C: Manual "Send Money & Verify" (Zero Cost MVP)
- **Why:** 100% free. Perfect for testing if people will pay before buying a gateway.
- **Workflow:**
  1. User selects "Pro Pack (100 BDT)".
  2. UI shows your personal/merchant bKash number: *"Send 100 BDT to 017XXXXX and paste the TrxID here."*
  3. User pastes `8JH3K9L2M` and clicks Submit.
  4. The transaction goes into `pending` status.
  5. **Admin Panel:** You see a new pending payment. You check your bKash app, match the TrxID, and click "Approve". 
  6. The system automatically credits the tokens and emails the user.
- **Future:** You can automate Option C later by scraping SMS from an Android phone (using an app like SMS Gateway) pointing to your backend, but manual is best for the first week.

I will structure the database and code so we can start with **Option C (Manual / TrxID)** or **Option A (aamarPay)** easily.

---

## 7 — Token System & Pricing

**Token Economy:**
- **1 Full Build Generation** = 10 Tokens
- **1 Component Tweak** = 5 Tokens (after free tweaks are exhausted)

**Package Tiers & Perks:**

| Feature/Pack | Guest (Free) | Starter Pack (50 ৳) | Pro Pack (100 ৳) | Enthusiast Pack (350 ৳) |
|---|---|---|---|---|
| **Tokens Granted** | 10 (1 Build) | 30 Tokens | 70 Tokens | 300 Tokens |
| **Free Tweaks** | None | 3 per session | 15 per session | Unlimited / Free |
| **Component Swapping** | ❌ Locked | ✅ Access | ✅ Access | ✅ Access |
| **AI Evaluation/Reasoning** | ❌ Hidden | ✅ Visible | ✅ Visible | ✅ Visible |
| **Build Sharing URL** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Save to Profile** | ❌ (No Profile)| ✅ Yes | ✅ Yes | ✅ Yes |

*Note: Guest mode allows a user to generate exactly one build (costing their 10 free tokens) to see the final components and total price. However, they cannot swap components, tweak the build, or read the detailed AI reasoning until they create an account and purchase a pack.*

---

## 8 — Docker Compose Changes

Add `backend_b2c` as a new service. Keep existing `backend` (catalog scraper) unchanged.

```yaml
# Addition to docker-compose.yml
backend_b2c:
  build:
    context: ./backend_b2c
    dockerfile: Dockerfile
  container_name: zenfa_backend_b2c
  ports:
    - "8001:8001"
  environment:
    DATABASE_URL: ${B2C_DATABASE_URL}   # points to zenfa_b2c DB
    REDIS_URL: ${REDIS_URL}
    SECRET_KEY: ${SECRET_KEY}
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    AAMARPAY_STORE_ID: ${AAMARPAY_STORE_ID}
    AAMARPAY_SIGNATURE_KEY: ${AAMARPAY_SIGNATURE_KEY}
    BREVO_API_KEY: ${BREVO_API_KEY}
    ENGINE_INTERNAL_URL: http://backend:8000  # call catalog/engine
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```

---

## Verification Plan

### Automated Tests
> Tests live in `backend_b2c/tests/` using pytest + httpx TestClient (same pattern as existing `test_skyland.py`)

```bash
# Run all B2C backend tests
cd backend_b2c
pytest tests/ -v

# Specific areas
pytest tests/test_auth.py -v       # JWT, registration, login
pytest tests/test_builder.py -v    # session start, tweak, save
pytest tests/test_payments.py -v   # initiate + webhook/manual approval
pytest tests/test_support.py -v    # ticket create, reply, status update
pytest tests/test_admin.py -v      # admin endpoints, role guard
```

Tests use an **in-memory SQLite** DB (same proven approach as your existing test suite) and mock external services (Brevo).

### Manual Browser Verification (per phase)
1. **Phase 1 (Core):** Start `npm run dev` in `frontend_b2c/`, visit `localhost:3000` → fill builder form → confirm loading screen → confirm result page shows AI build
2. **Phase 2 (Payments):** Test the manual TrxID submission or aamarPay sandbox → confirm token balance increases → confirm builder start deducts a token
3. **Phase 4 (Support):** Create a ticket as a user → log in as admin → reply to ticket → confirm user gets email notification
4. **Admin Panel:** Log in with `role=admin` account → confirm `/admin` routes are accessible → confirm regular users are redirected away

---

## What We're NOT Building Yet (Future)
- PDF / social share image export (Phase 5)
- Live chat (WebSocket) — tickets are sufficient for MVP
- bKash direct API (Very hard to get access without a large registered company)
- B2B vendor portal (separate website, separate plan)
