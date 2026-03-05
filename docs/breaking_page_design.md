# PC Lagbe? — Breaking Page Design (`/breaking`)

> The **Breaking** page is a curated tech news feed focused on PC hardware. Think of it as a mini TechRadar / VideoCardz specifically filtered for what matters to Bangladeshi PC builders: GPU launches, price drops, benchmarks, and hot Reddit takes.

---

## Page Purpose

Give users a reason to visit PC Lagbe even when they're not building a PC. This makes the site a **daily destination** instead of a one-time tool. It also positions PC Lagbe as a trusted voice in the BD tech space.

---

## Content Sources

| Source | Type | Method |
|---|---|---|
| **Manual curation** (admin-posted) | Staff picks, original analysis | Admin creates articles via dashboard |
| **Reddit scraping** (r/buildapc, r/hardware, r/pcgaming) | Community discussions, reviews | RSS / API → auto-import headlines |
| **Tech sites** (VideoCardz, TechPowerUp, Tom's Hardware) | GPU/CPU launches, benchmarks | RSS feed parsing |
| **Local BD context** (StarTech blog, Ryans promos) | Price drops, vendor promotions | Manual + scraper alerts |
| **PC Lagbe AI** | AI-generated summaries of articles | Gemini summarizes scraped articles |

---

## Page Layout

```
┌─ /breaking ───────────────────────────────────────────────────────────────┐
│  bg-black, max-w-6xl centered                                             │
│                                                                           │
│  ┌─ PAGE HEADER ──────────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ⚡ Breaking                                                      │   │
│  │  The latest in PC hardware, prices, and tech.                      │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ CATEGORY FILTER BAR ─────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │   All   GPU   CPU   RAM & Storage   Deals   Benchmarks   BD News  │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ FEATURED / HERO ARTICLE ─────────────────────────────────────────┐   │
│  │  glass-card-glow, full width, taller                               │   │
│  │                                                                    │   │
│  │  ┌─────────────────────────────┐  ┌────────────────────────────┐  │   │
│  │  │                             │  │                            │  │   │
│  │  │   HERO IMAGE / THUMBNAIL   │  │  🔴 HOT                   │  │   │
│  │  │   (16:9 aspect ratio,      │  │                            │  │   │
│  │  │    rounded, gradient        │  │  NVIDIA RTX 5070 Officially│  │   │
│  │  │    overlay at bottom)       │  │  Announced — Here's What  │  │   │
│  │  │                             │  │  It Means for BD Prices   │  │   │
│  │  │                             │  │                            │  │   │
│  │  │                             │  │  The RTX 5070 launches at  │  │   │
│  │  │                             │  │  $549 globally. We break   │  │   │
│  │  │                             │  │  down what the BD price    │  │   │
│  │  │                             │  │  will likely be and when...│  │   │
│  │  │                             │  │                            │  │   │
│  │  │                             │  │  GPU · 2h ago · 3 min read │  │   │
│  │  │                             │  │  [ Read Article → ]       │  │   │
│  │  └─────────────────────────────┘  └────────────────────────────┘  │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ ARTICLE GRID (3 columns) ────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ ARTICLE CARD ──────┐ ┌─ ARTICLE CARD ──────┐ ┌─ ARTICLE ────┐│   │
│  │  │  glass-card          │ │  glass-card          │ │  CARD        ││   │
│  │  │                      │ │                      │ │              ││   │
│  │  │  ┌──────────────┐    │ │  ┌──────────────┐    │ │  ┌────────┐  ││   │
│  │  │  │  thumbnail    │    │ │  │  thumbnail    │   │ │  │  thumb │  ││   │
│  │  │  └──────────────┘    │ │  └──────────────┘    │ │  └────────┘  ││   │
│  │  │                      │ │                      │ │              ││   │
│  │  │  DDR5 Prices Hit     │ │  Ryzen 9000X3D:      │ │  RTX 4060   ││   │
│  │  │  All-Time Low in BD  │ │  Release Date &      │ │  vs RX 7600 ││   │
│  │  │                      │ │  Expected Pricing    │ │  in 2026    ││   │
│  │  │  RAM · 5h ago        │ │  CPU · 1d ago        │ │  GPU · 2d   ││   │
│  │  │  📖 from TechPowerUp │ │  📖 from VideoCardz  │ │  📖 Reddit  ││   │
│  │  └──────────────────────┘ └──────────────────────┘ └──────────────┘│   │
│  │                                                                    │   │
│  │  ... (load more / infinite scroll)                                │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ SIDEBAR (optional, on desktop) ──────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ PRICE TRACKER WIDGET ─────────────────────────────────────┐   │   │
│  │  │  glass-card                                                │   │   │
│  │  │                                                            │   │   │
│  │  │  📉 Price Movers Today                                    │   │   │
│  │  │                                                            │   │   │
│  │  │  RTX 4060         ৳38,500  ↓ ৳2,000 (5.2%)              │   │   │
│  │  │  Ryzen 5 7600     ৳21,800  ↓ ৳1,200 (5.5%)              │   │   │
│  │  │  Kingston 16GB    ৳5,500   ↑ ৳300  (5.5%)               │   │   │
│  │  │                                                            │   │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                    │   │
│  │  ┌─ HOT ON REDDIT ────────────────────────────────────────────┐   │   │
│  │  │  glass-card                                                │   │   │
│  │  │                                                            │   │   │
│  │  │  🔥 Hot on r/buildapc                                    │   │   │
│  │  │                                                            │   │   │
│  │  │  "Is 16GB still enough in 2026?" — 847 upvotes            │   │   │
│  │  │  "My first build after using PC Lagbe" — 423 upvotes      │   │   │
│  │  │  "RX 9070 XT review megathread" — 1.2k upvotes           │   │   │
│  │  │                                                            │   │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Article Card Structure

Each article card shows:

| Element | Style |
|---|---|
| Thumbnail | `aspect-video rounded-lg overflow-hidden` with gradient overlay. Use OG image from scraped source, or a generated placeholder. |
| Category badge | `text-xs uppercase font-bold tracking-wider` — color-coded: GPU=teal, CPU=orange, RAM=purple, Deals=red |
| Title | `text-lg font-bold text-white line-clamp-2` |
| Excerpt | `text-sm text-neutral-400 line-clamp-2` (AI-summarized for scraped articles) |
| Meta | `text-xs text-neutral-600` — Category · Time ago · Read time |
| Source | `📖 from [Source Name]` in `text-xs text-neutral-500` with source favicon |

---

## Article Detail Page (`/breaking/{slug}`)

```
┌─ /breaking/rtx-5070-bd-pricing ───────────────────────────────────────────┐
│  bg-black, max-w-3xl centered (article layout)                             │
│                                                                           │
│  ← Back to Breaking                                                      │
│                                                                           │
│  🔴 GPU                                                                  │
│                                                                           │
│  NVIDIA RTX 5070 Officially Announced —                                   │
│  Here's What It Means for BD Prices                                       │
│                                                                           │
│  By PC Lagbe Team  ·  March 6, 2026  ·  3 min read                        │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────┐            │
│  │                    HERO IMAGE                              │            │
│  └───────────────────────────────────────────────────────────┘            │
│                                                                           │
│  Article body in markdown...                                              │
│  - prose styles: text-neutral-300, headings in white                     │
│  - inline price comparisons in teal                                       │
│  - embedded component links → /components/{slug}                          │
│                                                                           │
│  ┌─ RELATED BUILDS (glass-card) ─────────────────────────────────────┐   │
│  │  "Builds featuring the RTX 5070:"                                  │   │
│  │  [Build Card Mini] [Build Card Mini] [Build Card Mini]            │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ SOURCE ──────────────────────────────────────────────────────────┐   │
│  │  Original article: [VideoCardz](https://videocardz.com/...)       │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Share: [Copy Link] [Facebook] [Twitter]                                  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Category Color System

| Category | Badge Color | Icon |
|---|---|---|
| GPU | `bg-[#4f9e97]/10 text-[#4f9e97]` | 🖥️ |
| CPU | `bg-orange-500/10 text-orange-400` | ⚙️ |
| RAM & Storage | `bg-purple-500/10 text-purple-400` | 💾 |
| Deals | `bg-red-500/10 text-red-400` | 🏷️ |
| Benchmarks | `bg-blue-500/10 text-blue-400` | 📊 |
| BD News | `bg-green-500/10 text-green-400` | 🇧🇩 |

---

## Content Pipeline (How Articles Get Created)

### v1 — Manual + Semi-Auto
1. **Admin creates** articles directly from the Admin Dashboard (title, body, category, thumbnail).
2. **RSS auto-import:** Backend cron job parses RSS feeds from VideoCardz, TechPowerUp, Tom's Hardware every 2 hours. Auto-creates draft articles with the headline + link. Admin approves to publish.
3. **AI Summary:** When an article is auto-imported, pass the source URL to Gemini to generate a 2–3 sentence summary + a "BD Impact" note (e.g., "Expected BD price: ৳65,000–৳72,000 based on current import trends").

### v2 — Fully Automated
- Reddit hot posts from r/buildapc, r/hardware auto-imported as "Community Discussions" with upvote counts.
- Price drop alerts from the scraper auto-generate "Deal Alert" articles.
- Gemini writes full articles from press releases.

---

## Data Requirements

| Endpoint | Description |
|---|---|
| `GET /api/articles?category=gpu&page=1` | Paginated article list with filtering |
| `GET /api/articles/{slug}` | Single article detail |
| `POST /api/admin/articles` | Admin creates article |
| `PATCH /api/admin/articles/{id}` | Admin edits/publishes article |
| `GET /api/articles/featured` | Current hero/featured article |
| `GET /api/price-movers` | Today's biggest price changes (sidebar widget) |
| `GET /api/reddit/hot?sub=buildapc&limit=5` | Hot Reddit posts (sidebar widget) |

---

## Admin Dashboard Integration

Add to the existing Admin Dashboard:
- **"Manage Articles"** section with a table of all articles (draft/published/archived).
- **"Create Article"** button — opens a simple markdown editor with title, category, thumbnail upload, and body.
- **"RSS Queue"** — shows auto-imported headlines pending review. Admin clicks "Approve" to publish or "Dismiss" to discard.

---

## SEO Strategy

- Each article gets a unique, keyword-rich URL: `/breaking/rtx-5070-bangladesh-price-prediction`
- Dynamic OG images showing article thumbnail + title (same approach as build share pages)
- Articles are server-rendered (SSR/SSG via Next.js) for Google indexing
- Category pages: `/breaking?category=gpu` — indexable landing pages for "GPU news Bangladesh"

---

## Style Notes
- Overall: Same dark glassmorphic design system.
- Article cards: `glass-card p-0 overflow-hidden` — thumbnail bleeds edge-to-edge at top.
- Article detail: Clean reading experience, `prose prose-invert` Tailwind typography.
- Source attribution always visible — we're curating, not plagiarizing.
