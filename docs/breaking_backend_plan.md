# Breaking Page — Backend Implementation Plan

> Backend architecture for the `/breaking` tech news system. Covers the database schema, news scrapers, admin CRUD, AI summarization, and the API endpoints that also power the landing page news ticker.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTENT SOURCES                                  │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ RSS Feeds    │  │ Reddit API   │  │ Vendor Sites │  │ Admin Panel │ │
│  │ (TechPowerUp │  │ r/buildapc   │  │ StarTech FB  │  │ Manual CRUD │ │
│  │  VideoCardz  │  │ r/hardware   │  │ Ryans Blog   │  │             │ │
│  │  Tom's HW)   │  │ r/pcgaming   │  │ TechLand     │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
│         ▼                 ▼                 ▼                 ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    NEWS INGESTION PIPELINE                          │ │
│  │                                                                     │ │
│  │  1. Scraper/RSS fetches raw content                                │ │
│  │  2. Deduplication check (by source_url hash)                       │ │
│  │  3. Gemini AI generates summary + BD impact note                   │ │
│  │  4. Auto-categorize (GPU/CPU/RAM/Deals/Benchmarks/BD News)         │ │
│  │  5. Save as DRAFT (auto-imported) or PUBLISHED (admin)             │ │
│  └──────────────────────────┬──────────────────────────────────────────┘ │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     PostgreSQL — articles TABLE                     │ │
│  └──────────────────────────┬──────────────────────────────────────────┘ │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      FastAPI ENDPOINTS                              │ │
│  │                                                                     │ │
│  │  GET  /articles              (public: paginated list + filter)      │ │
│  │  GET  /articles/headlines    (public: top 6 for landing ticker)     │ │
│  │  GET  /articles/{slug}       (public: single article)              │ │
│  │  GET  /articles/featured     (public: hero article)                │ │
│  │  POST /admin/articles        (admin: create article)               │ │
│  │  PATCH /admin/articles/{id}  (admin: edit/publish/archive)         │ │
│  │  GET  /admin/articles/queue  (admin: pending auto-imports)         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Database Schema

Lives in `backend_b2c/app/models/article.py`. Uses SQLModel, same as existing models.

### `Article` Model

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | Primary key, auto-generated |
| `title` | `str` | Required, indexed |
| `slug` | `str` | URL-safe, unique, indexed. Auto-generated from title |
| `excerpt` | `str` | 2–3 sentence summary (AI-generated for scraped, manual for admin) |
| `body` | `str` (text) | Full article content in markdown. For scraped articles = AI summary + BD impact. For admin = full writeup |
| `category` | `CategoryEnum` | Enum: `gpu`, `cpu`, `ram_storage`, `deals`, `benchmarks`, `bd_news` |
| `status` | `StatusEnum` | Enum: `draft`, `published`, `archived` |
| `source` | `SourceEnum` | Enum: `admin`, `rss`, `reddit`, `vendor` |
| `source_url` | `Optional[str]` | Original article URL for attribution. NULL for admin-authored |
| `source_name` | `Optional[str]` | e.g., "VideoCardz", "r/buildapc", "StarTech" |
| `thumbnail_url` | `Optional[str]` | OG image from source or uploaded by admin |
| `is_featured` | `bool` | Only one article should be featured at a time |
| `is_hot` | `bool` | Red "HOT" badge on the card |
| `read_time_minutes` | `int` | Estimated read time (word count / 200) |
| `view_count` | `int` | Tracks page views for popularity sorting |
| `created_at` | `datetime` | Timestamp |
| `published_at` | `Optional[datetime]` | When status changed to `published` |
| `author_id` | `Optional[UUID]` | FK to `users.id` for admin-authored articles |

### DB Index Strategy
- `(status, published_at DESC)` — fast query for latest published articles
- `(category, status)` — fast category filtering
- `UNIQUE(source_url)` — deduplication for scraped articles
- `UNIQUE(slug)` — URL routing

---

## 2. News Scrapers

All news scrapers live in `backend_b2c/app/services/news/`. They do NOT extend the existing `BaseScraper` (which is Playwright-heavy for product scraping). News scraping is much lighter — mostly RSS and HTTP.

### 2a. RSS Feed Scraper

**File:** `backend_b2c/app/services/news/rss_scraper.py`

| Feed | URL | Category default |
|---|---|---|
| VideoCardz | `https://videocardz.com/feed` | `gpu` |
| TechPowerUp | `https://www.techpowerup.com/rss/news` | auto-detect |
| Tom's Hardware | `https://www.tomshardware.com/feeds/all` | auto-detect |
| AnandTech/Ars | Others as needed | auto-detect |

**Logic:**
1. Use `feedparser` library to parse RSS XML
2. For each entry:
   - Check if `source_url` already exists in DB → skip if duplicate. **Note: Normalize URLs before hashing/saving (strip trailing slashes and common tracking parameters like `?utm_source`) to prevent duplicate bypassing.**
   - Extract: title, link, published date, thumbnail (from `media:content` or `enclosure`)
   - **Image Handling:** Download the `thumbnail_url` locally or proxy it through the frontend to avoid 403 Forbidden errors due to strict anti-hotlinking/CORS policies from source sites.
   - Call Gemini to generate: `excerpt` (2-line summary) + `body` (3-paragraph summary with BD relevance). **Note: Wrap Gemini calls in a `try/except` block. If Gemini fails/timeouts, fallback to the original RSS `<description>` as the body, save as draft, and flag for admin review.**
   - Auto-categorize based on keywords in title (GPU→gpu, Ryzen/Intel→cpu, DDR/SSD→ram_storage, etc.)
   - Save as `status=draft` for admin review

**Schedule:** Cron job via `APScheduler` — runs every 2 hours.

### 2b. Reddit Scraper

**File:** `backend_b2c/app/services/news/reddit_scraper.py`

**Method:** Use Reddit's public JSON API (no auth needed for read-only):
- `https://www.reddit.com/r/buildapc/hot.json?limit=10`
- `https://www.reddit.com/r/hardware/hot.json?limit=10`

**Logic:**
1. Fetch top 10 hot posts from each subreddit. **Note: Set a custom, unique `User-Agent` header (e.g., `User-Agent: "PCLagbeNewsBot/1.0"`) to prevent IP blocking/429 errors from Reddit's strict rate-limiting on default HTTP clients.**
2. Filter: only posts with `score > 100` (skip low-quality)
3. Check dedup by `source_url` (reddit permalink)
4. Save as `draft` with `source=reddit`, `source_name="r/buildapc"`
5. No AI summary needed — use the Reddit post title as the headline and the self-text/top-comment as the excerpt

**Schedule:** Every 4 hours.

### 2c. Vendor News Scraper

**File:** `backend_b2c/app/services/news/vendor_scraper.py`

**Targets:**
| Vendor | Source | What to Scrape |
|---|---|---|
| StarTech | `startech.com.bd/blog` or Facebook posts | New product arrivals, Eid/11.11 offers, flash sales |
| Ryans | `ryanscomputers.com/blog` | Similar |
| TechLand | TechLand promos page | Seasonal offers |

**Method:** 
- For website blogs: Simple HTTP GET + BeautifulSoup (no Playwright needed, these are static pages)
- For Facebook: Use Facebook's public page RSS or a lightweight page scraper. Alternatively, admins can manually paste Facebook post links and the system extracts the content.

**Logic:**
1. Scrape the blog/promo page for new entries
2. Dedup by URL
3. Auto-tag as `category=deals` + `source=vendor`
4. Save as `draft`

**Schedule:** Every 6 hours for blogs. Facebook → manual or webhook-based.

---

## 3. AI Summarization Pipeline

**File:** `backend_b2c/app/services/news/summarizer.py`

Uses the existing Gemini integration. When a new article is scraped:

```
Prompt Template:
─────────────────
You are a tech journalist writing for PC Lagbe?, a Bangladeshi PC building platform.

Summarize this article in 2-3 sentences for the excerpt.
Then write a 3-paragraph body:
  1. What happened (the news)
  2. Why it matters for PC builders
  3. Bangladesh impact (expected local pricing if applicable, availability timeline)

Article title: {title}
Article URL: {source_url}
Article text: {raw_content_or_rss_description}

Category: {auto_detected_category}
─────────────────
```

**Output:** Returns `{ excerpt, body, category_suggestion }`.

**Failure Handling:** Wrap API requests in a robust `try/except` block. Handle timeouts and rate limits gracefully, falling back to raw scraped text when AI generation fails.

**Cost control:** Only call Gemini for RSS and vendor articles. Reddit posts use their own content. Estimated ~50 API calls/day at peak.

---

## 4. API Endpoints

All routes live in `backend_b2c/app/api/articles.py` (public) and `backend_b2c/app/api/admin/articles.py` (admin).

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/articles` | Paginated article list. Query params: `category`, `source`, `page`, `limit`, `sort` (latest/popular) |
| `GET` | `/articles/headlines` | Returns top 6 published articles (title + slug only) for the landing page news ticker. Sorted by `published_at DESC`. Cached 5 min. |
| `GET` | `/articles/featured` | Returns the single article where `is_featured=True` |
| `GET` | `/articles/{slug}` | Single article by slug. Increments `view_count` |

### Admin Endpoints (Requires Auth via FastAPI `Depends()` verifying admin JWT/session)

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/articles` | All articles (including drafts). Filterable by `status` |
| `GET` | `/admin/articles/queue` | Only `status=draft` articles (the review queue) |
| `POST` | `/admin/articles` | Create new article manually |
| `PATCH` | `/admin/articles/{id}` | Edit article fields. Set `status=published` to publish, `status=archived` to hide |
| `DELETE` | `/admin/articles/{id}` | Hard delete (admin only) |
| `PATCH` | `/admin/articles/{id}/feature` | Toggle `is_featured` (auto-unfeatures the previous one) |

---

## 5. Landing Page Ticker Integration

The `GET /articles/headlines` endpoint powers the landing page breaking news ticker bar. 

**Response shape:**
```json
[
  { "title": "NVIDIA RTX 5070 drops to ৳65k at StarTech", "slug": "rtx-5070-startech-price" },
  { "title": "AMD announces Ryzen 9000X3D release date", "slug": "ryzen-9000x3d-release" },
  { "title": "DDR5 prices hit all-time low in Bangladesh", "slug": "ddr5-price-drop-bd" }
]
```

- Frontend fetches this on page load (or via ISR/SSR)
- Falls back to hardcoded mock data if the API is unreachable

---

## 6. Scheduler Setup

**File:** `backend_b2c/app/services/news/scheduler.py`

Uses `APScheduler` (add to `requirements.txt`) to run scraping jobs on a schedule.

| Job | Interval | Function |
|---|---|---|
| RSS feed scrape | Every 2 hours | `rss_scraper.scrape_all_feeds()` |
| Reddit hot posts | Every 4 hours | `reddit_scraper.scrape_hot_posts()` |
| Vendor blogs | Every 6 hours | `vendor_scraper.scrape_vendor_blogs()` |

**Startup:** Scheduler starts in the FastAPI `lifespan` handler (same pattern as `init_db()`). **Crucial: Ensure use of `AsyncIOScheduler` (not `BackgroundScheduler`) to prevent blocking the async event loop during long-running syncing/AI generation tasks.**

---

## 7. File Structure (New Files)

```
backend_b2c/
├── app/
│   ├── models/
│   │   └── article.py            ← NEW: Article, ArticleCreate, ArticleUpdate, ArticleResponse
│   ├── api/
│   │   ├── articles.py           ← NEW: Public article endpoints
│   │   └── admin/
│   │       └── articles.py       ← NEW: Admin article CRUD + queue
│   └── services/
│       └── news/
│           ├── __init__.py       ← NEW
│           ├── rss_scraper.py    ← NEW: RSS feed parsing
│           ├── reddit_scraper.py ← NEW: Reddit JSON API
│           ├── vendor_scraper.py ← NEW: StarTech/Ryans blog scraping
│           ├── summarizer.py     ← NEW: Gemini AI summarization
│           └── scheduler.py      ← NEW: APScheduler cron jobs
```

---

## 8. Dependencies to Add

Add to `backend_b2c/requirements.txt`:
```
feedparser>=6.0        # RSS feed parsing
apscheduler>=3.10      # Background job scheduling
httpx>=0.27            # Async HTTP client for Reddit JSON API
```

No new database migration tool needed — SQLModel's `create_all` handles new tables in dev. For production, use the existing Alembic setup.

---

## 9. Config Additions

Add to `backend_b2c/app/config.py` Settings:

```python
# News scraping
gemini_api_key: str = ""              # For AI summarization
rss_scrape_interval_hours: int = 2
reddit_scrape_interval_hours: int = 4
vendor_scrape_interval_hours: int = 6
```

---

## 10. Implementation Order

| Step | What | Depends On |
|---|---|---|
| 1 | `Article` model + Alembic migration | Nothing |
| 2 | Admin CRUD endpoints (`POST`, `PATCH`, `GET`, `DELETE`) | Step 1 |
| 3 | Public endpoints (`GET /articles`, `GET /articles/{slug}`, `GET /articles/headlines`) | Step 1 |
| 4 | Landing page ticker → fetch from `/articles/headlines` instead of mock data | Step 3 |
| 5 | RSS scraper + `feedparser` integration | Step 1 |
| 6 | AI summarizer (Gemini) | Step 5 |
| 7 | Scheduler (APScheduler) to auto-run scrapers | Steps 5, 6 |
| 8 | Reddit scraper | Step 1 |
| 9 | Vendor blog scraper | Step 1 |
| 10 | Admin Dashboard UI: Article management + RSS queue | Step 2 |
