# PC Lagbe? × Zenfa AI — UI Integration Guide

> This document maps every Zenfa AI engine field to a concrete UI element in the PC Lagbe? B2C website, provides the exact JSON payloads your frontend must send/receive, and details the full B2C feature set including token economy, gamification, and admin tooling.

---

## Architecture Overview

```
┌──────────────────────────────┐           ┌──────────────────────┐
│     PC Lagbe? Website        │           │   Zenfa AI Engine    │
│     (Next.js @ :3000)        │           │   (FastAPI @ :8000)  │
│                              │           │                      │
│  • Collects inputs           │           │  • Knapsack solver   │
│  • Shows results / PDF       │           │  • LLM evaluator     │
│  • Manages sessions & tokens │           │  • Compatibility     │
│  • Gamification / Leaderboard│           └──────────┬───────────┘
│  • Admin Panel               │                      │
└──────────────┬───────────────┘                      │
               │ HTTP                                 │
       ┌───────▼──────────────┐      POST             │
       │     backend_b2c      │ ──────────────────────┘
       │  FastAPI @ :8001     │  /internal/build (server-to-server)
       │                      │
       │ • Auth (JWT + NextAuth)│
       │ • Token Economy       │
       │ • Payment (bKash/TrxID)│
       │ • Support Tickets     │
       │ • Referrals / Gamify  │
       │ • Build Session mgmt  │
       └──┬───────────────┬───┘
          │               │
  ┌───────▼───┐   ┌──────▼─────────┐
  │ zenfa_b2c │   │ zenfa_catalog  │
  │ PostgreSQL│   │ PostgreSQL     │
  │ (Users,   │   │ (Components,   │
  │  Tokens,  │   │  Prices, etc.) │
  │  Referrals│   └────────────────┘
  │  Builds)  │
  └───────────┘
```

**Key Rules:**
1. The **browser** (Next.js client) NEVER calls the engine directly. All engine calls flow through `backend_b2c` (port 8001).
2. The `/internal/*` gateway on the engine has no auth. It is server-to-server only.
3. `backend_b2c` handles **all** user state: authentication, tokens, payments, sessions, referrals, and support.

---

## Section 1: Input Form → BuildRequest Mapping

### Current UI State

| UI Element | Status | Engine Field |
|---|---|---|
| Budget slider (single thumb) | ✅ Exists | `budget_min` / `budget_max` |
| Primary Use (4 buttons) | ⚠️ Needs rename | `purpose` |
| CPU Brand preference | ❌ Missing | `preferences.prefer_cpu_brand` |
| GPU Brand preference | ❌ Missing | `preferences.prefer_gpu_brand` |
| Include Monitor toggle | ❌ Missing | `preferences.include_monitor` |
| Form Factor selector | ❌ Missing | `preferences.form_factor` |
| RGB Priority selector | ❌ Missing | `preferences.rgb_priority` |
| Min Storage selector | ❌ Missing | `preferences.min_storage_gb` |
| Wi-Fi toggle | ❌ Missing | `preferences.prefer_wifi` |

---

### 1.1 Budget Slider

**Engine fields:** `budget_min` (int), `budget_max` (int) — both in BDT (৳)

**UI Options (pick one):**
- **Option A — Single slider (current):** Send `budget_min = budget_max = sliderValue`. The engine treats this as a fixed budget.
- **Option B — Dual-thumb range slider:** Let users pick a range (e.g., ৳60k–৳65k). More flexible.

```
Range: ৳30,000 → ৳500,000
Step:  ৳5,000
```

---

### 1.2 Purpose Buttons

**Engine field:** `purpose` — strict enum: `"gaming"` | `"editing"` | `"office"` | `"general"`

**Current UI:** Gaming, Workstation, Editing, Office  
**Fix:** Rename **"Workstation"** → **"General"**, OR map it to `"editing"` in your JS.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Gaming  │  │ Editing  │  │  Office  │  │ General  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

### 1.3 Advanced Preferences Panel

Add a collapsible **"Advanced Preferences"** section below the Purpose buttons. This maps to the `preferences` object.

#### CPU Brand — Segmented Control
```
[ Intel ]  [ AMD ]  [ No Preference ]
```
→ Sends: `"prefer_cpu_brand": "Intel"` or `"AMD"` or `null`

#### GPU Brand — Segmented Control
```
[ NVIDIA ]  [ AMD ]  [ Intel ]  [ No Preference ]
```
→ Sends: `"prefer_gpu_brand": "NVIDIA"` or `"AMD"` or `"Intel"` or `null`

#### Form Factor — Dropdown or Pills
```
[ Standard (ATX) ▾ ]
  • Standard (ATX)
  • Compact (mATX)
  • Tiny (ITX)
```
→ Sends: `"form_factor": "ATX"` or `"mATX"` or `"ITX"` or `null`

#### RGB Lighting — Segmented Control
```
[ Heavy RGB ]  [ Some ]  [ None ]
```
→ Sends: `"rgb_priority": "high"` or `"medium"` or `"low"`  
Default: `"medium"`

#### Min Storage — Dropdown
```
[ 512 GB ▾ ]
  • 256 GB
  • 512 GB
  • 1 TB
  • 2 TB
```
→ Sends: `"min_storage_gb": 256` or `512` or `1000` or `2000`

#### Toggles
```
☐ Include Monitor in Budget       →  "include_monitor": true/false
☐ Must have Wi-Fi                  →  "prefer_wifi": true/false
```

---

## Section 2: The API Call (via `backend_b2c`)

> **Important Change:** The frontend does NOT call `/internal/build` directly. All requests are routed through `backend_b2c` (port 8001), which handles token deduction, session management, and then calls the Zenfa AI Engine internally.

### 2.1 User-Facing Flow

```
User clicks "Generate Build" on frontend (localhost:3000)
    │
    ▼
POST http://localhost:8001/builder/start
Headers: { Authorization: Bearer <JWT> }
Body: { budget, purpose, preferences }
    │
    ▼
backend_b2c internally:
  1. Validates user JWT & checks token balance (needs ≥ 10 tokens)
  2. Deducts 10 tokens from user's account
  3. Fetches all in-stock components from zenfa_catalog DB
  4. Calls POST http://localhost:8000/internal/build with full payload
  5. Stores result in user's session (current_build JSONB)
  6. Returns BuildResponse to the frontend
```

### 2.2 Full Engine Request Payload (assembled by `backend_b2c`)

```json
{
  "budget_min": 60000,
  "budget_max": 65000,
  "purpose": "gaming",
  "components": [
    {
      "id": 1,
      "name": "AMD Ryzen 5 7600",
      "slug": "amd-ryzen-5-7600",
      "component_type": "cpu",
      "brand": "AMD",
      "performance_score": 72,
      "price_bdt": 23000,
      "vendor_name": "StarTech",
      "vendor_url": "https://startech.com.bd/...",
      "in_stock": true,
      "specs": {
        "socket": "AM5",
        "core_count": 6,
        "thread_count": 12,
        "base_clock_ghz": 3.8,
        "boost_clock_ghz": 5.1,
        "tdp": 65,
        "integrated_graphics": false
      }
    }
    // ... 100+ more components from zenfa_catalog DB
  ],
  "preferences": {
    "prefer_cpu_brand": "AMD",
    "prefer_gpu_brand": "NVIDIA",
    "include_monitor": false,
    "form_factor": "ATX",
    "rgb_priority": "medium",
    "min_storage_gb": 512,
    "prefer_wifi": false
  }
}
```

> **Important:** The `components` array is the entire catalog of in-stock parts from the `zenfa_catalog` database. The engine picks from this list — it does NOT have its own database.

### 2.3 Backend-to-Engine Call (inside `backend_b2c`)

```python
# backend_b2c/app/services/engine_gateway.py

import httpx
from ..config import get_settings

settings = get_settings()

async def call_zenfa_engine(budget: int, purpose: str, preferences: dict, components: list):
    """Calls the Zenfa AI Engine's internal build endpoint."""
    payload = {
        "budget_min": budget,
        "budget_max": budget,
        "purpose": purpose,
        "components": components,
        "preferences": preferences,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.engine_internal_url}/internal/build",
            json=payload,
        )
        response.raise_for_status()
        return response.json()
```

---

## Section 3: Response → Results Page Mapping

### 3.1 Response Structure (from Zenfa AI Engine)

```json
{
  "build": {
    "components": [
      {
        "id": 1,
        "name": "AMD Ryzen 5 7600",
        "component_type": "cpu",
        "price_bdt": 23000,
        "vendor_name": "StarTech",
        "vendor_url": "https://...",
        "specs": { "socket": "AM5", "core_count": 6 }
      }
    ],
    "total_price": 63500,
    "remaining_budget": 1500
  },
  "quality": {
    "score": 9.2,
    "scores_breakdown": {
      "performance_match": 3,
      "value_score": 3,
      "build_balance": 2,
      "future_proofing": 1,
      "community_trust": 1
    },
    "iterations_used": 2,
    "time_taken_seconds": 4.3
  },
  "explanation": {
    "summary": "A balanced 1080p gaming build...",
    "per_component": {
      "cpu": "The Ryzen 5 7600 gives you 6 cores on a future-proof AM5 socket.",
      "gpu": "The RTX 4060 handles modern games at high settings with DLSS 3."
    },
    "trade_offs": "Opted for 16GB RAM instead of 32GB to stay in budget.",
    "upgrade_path": "Add another 16GB RAM stick when budget allows."
  },
  "metadata": {
    "engine_version": "0.1.0",
    "llm_model": "gemini-2.0-flash",
    "cached": false
  }
}
```

### 3.2 Results Page UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR DREAM PC BUILD                          │
│                                                                 │
│   ┌─────────────┐   Score: 9.2/10  ★★★★★                       │
│   │  Score Ring  │   "A balanced 1080p gaming build..."         │
│   └─────────────┘                                               │
│                                                                 │
│   Total: ৳63,500    Remaining: ৳1,500    Tokens Left: 20       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────┐  CPU: AMD Ryzen 5 7600        ৳23,000  [Swap]       │
│   │ icon │  "6 cores on future-proof AM5 socket"                │
│   └──────┘  StarTech  [Buy →]                                   │
│                                                                 │
│   ┌──────┐  GPU: NVIDIA RTX 4060         ৳38,000  [Swap]       │
│   │ icon │  "Handles modern games with DLSS 3"                  │
│   └──────┘  Ryans  [Buy →]                                      │
│                                                                 │
│   ... (RAM, Storage, PSU, Case, Cooler, Motherboard) ...        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│   Trade-offs: "Opted for 16GB RAM to stay in budget."           │
│   Upgrade Path: "Add another 16GB RAM stick later."             │
│                                                                 │
│   [ Save Build ]  [ Download PDF ↓ ]  [ Share Link 🔗 ]        │
│   [ Start New Build ]                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Field → UI Mapping:**

| Response Field | UI Element |
|---|---|
| `quality.score` | Score ring / badge at the top |
| `quality.scores_breakdown.*` | 5 mini progress bars (hover tooltip) |
| `explanation.summary` | Text below the score |
| `build.components[]` | Component cards list |
| `*.vendor_url` | "Buy →" link on each component card |
| `explanation.per_component.*` | Subtitle text on each card |
| `explanation.trade_offs` | Info banner at the bottom |
| `explanation.upgrade_path` | "Next Upgrade" callout |
| `build.total_price` | Total price display |
| `build.remaining_budget` | "Budget remaining" badge |
| **User's `token_balance`** | **"Tokens Left" badge (from session)** |

---

## Section 4: Component Swap Flow (Tweaks)

When a user clicks **[Swap]** on a component:

1. Show a modal with AI-suggested alternatives (from `quality.suggestions` if score was < 8.5).
2. Also show a "Search All Components" option that queries the `zenfa_catalog` DB.
3. When user picks a replacement, `backend_b2c` constructs a **new `BuildRequest`** with the swapped component locked in, and calls `/internal/build` again.
4. **Token deduction:** Each tweak costs **5 tokens** (unless the user has remaining free tweaks from their purchased pack).

### Token Rules for Tweaks

| Pack | Free Tweaks per Session | Cost per Extra Tweak |
|---|---|---|
| Guest (Free) | 0 (swap locked) | N/A |
| Starter (50৳) | 3 | 5 tokens |
| Pro (100৳) | 15 | 5 tokens |
| Enthusiast (350৳) | Unlimited | Free |

---

## Section 5: Token Economy & Pricing

> Every interaction with the AI engine costs tokens. Users purchase token packs via bKash/Nagad or manual TrxID.

### Token Costs

| Action | Token Cost |
|---|---|
| 1 Full AI Build Generation | 10 Tokens |
| 1 Component Tweak/Swap | 5 Tokens (after free tweaks used) |

### Package Tiers

| Feature | Guest (Free) | Starter (50৳) | Pro (100৳) | Enthusiast (350৳) |
|---|---|---|---|---|
| **Tokens Granted** | 10 (1 Build) | 30 | 70 | 300 |
| **Free Tweaks** | None | 3/session | 15/session | Unlimited |
| **Component Swapping** | ❌ Locked | ✅ | ✅ | ✅ |
| **AI Reasoning Visible** | ❌ Hidden | ✅ | ✅ | ✅ |
| **Build Sharing URL** | ✅ | ✅ | ✅ | ✅ |
| **Save to Profile** | ❌ | ✅ | ✅ | ✅ |
| **PDF Export** | ✅ | ✅ | ✅ | ✅ |

### Payment Flow (Manual TrxID — MVP)

```
User selects "Pro Pack (100৳)" on /pricing
    ↓
UI shows: "Send ৳100 to bKash 017XXXXXXX, then paste TrxID below."
    ↓
User pastes TrxID → POST /payments/initiate { package: "pro", gateway: "manual", gateway_trx_id: "8JH3K..." }
    ↓
Transaction goes to "pending" status in zenfa_b2c DB
    ↓
Admin sees pending payment in /admin → verifies on bKash app → clicks "Approve"
    ↓
backend_b2c credits tokens to user → sends email confirmation
```

---

## Section 6: Gamification & Referral System

> Referrals drive organic user growth. Both the referrer and the new user earn bonus tokens.

### How It Works

1. Every user gets a unique `referral_code` (e.g., `H2K56XBT`) stored in the `users` table.
2. The user's Dashboard shows a copyable referral link: `pclagbe.com/register?ref=H2K56XBT`
3. When a new user signs up with a valid `ref` code:
   - **New user** receives **20 tokens** (10 free + 10 bonus)
   - **Referrer** receives **+10 tokens** and their `total_referrals` counter increments
4. The referral link is also embedded in Shared Build pages as the "Create Your Own PC" CTA.

### UI Elements

| Location | Element |
|---|---|
| Dashboard (`/dashboard`) | "Earn Free Tokens" card with copyable referral link |
| Dashboard | "View Leaderboard" button linking to `/dashboard/leaderboard` |
| Shared Build (`/build/[slug]`) | "Create Your Own PC" CTA button includes the sharer's `ref` code |

### Leaderboard (`/dashboard/leaderboard`)

A public ranking of the top 10 referrers showing:
- Rank (with 🏆 / 🥈 / 🥉 icons for top 3)
- Display name (or "Anonymous Builder")
- Masked email (e.g., `sul***@gmail.com`)
- Total invites count

### Admin View

The Admin Analytics Dashboard (`/admin`) includes a "Top Referrers" panel showing the top 5 promoters with full email addresses and referral counts.

---

## Section 7: Build Saving, Sharing & PDF Export

### Saving a Build

After the AI generates a result, the user can click **[Save Build]**:
- `POST /builder/save` stores the build in the `builds` table with a unique `share_slug`.
- Saved builds appear in the user's Dashboard under "Recent Builds".
- Guest users cannot save (they must register first).

### Sharing a Build

- Every saved build gets a public URL: `pclagbe.com/build/{share_slug}`
- The page displays the full component list, total price, and vendor links.
- **Dynamic OpenGraph Image:** When the link is shared on Facebook/Discord/WhatsApp, a dynamic preview image is generated showing the build's Total Price, CPU, and GPU (powered by `next/og` at `build/[slug]/opengraph-image.tsx`).

### PDF Export

- Both the Build Result page and the Shared Build page have a **[Download PDF ↓]** button.
- Uses `html2canvas` + `jspdf` to capture the styled component list and export a clean, A4-sized PDF.
- The PDF includes: component list, prices, vendor names, total price, and the AI's reasoning summary.
- File naming: `PCLagbe_Build_{purpose}.pdf`

---

## Section 8: Dashboard & User Profile

### Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  MY DASHBOARD                              [ New Build ]    │
│                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────┐ │
│  │  Current Balance             │  │  Quick Stats         │ │
│  │  ██████████ 20 Tokens        │  │  0 Saved Builds      │ │
│  │  "2 Full AI Builds"          │  │  3 Support Tickets → │ │
│  │  [Get More Tokens]           │  │                      │ │
│  │  [View Leaderboard ★]       │  │                      │ │
│  └──────────────────────────────┘  └──────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  🎁 Earn Free Tokens                                    │ │
│  │  Share your referral link → both earn 10 tokens!        │ │
│  │  [ http://pclagbe.com/register?ref=H2K56XBT ] [Copy]   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Recent Builds                                              │
│  (Empty state: "Start your first build" link)               │
└─────────────────────────────────────────────────────────────┘
```

### Admin Dashboard (`/admin`)

The admin panel is a **protected section of the same Next.js app** (not a separate app), guarded by `role === 'admin'` checks.

| Tab/Page | Purpose |
|---|---|
| `/admin` | Analytics: revenue, user count, pending payments, open tickets, **Top Referrers** |
| `/admin/users` | Search users, view/edit token balance, ban/unban |
| `/admin/tickets` | Support queue: assign, reply, change priority/status |
| `/admin/transactions` | View all payments, approve pending manual TrxIDs |
| `/admin/announcements` | Post system-wide banners (shown to all users) |

---

## Section 9: Loading States

| State | Duration | UI |
|---|---|---|
| User clicks "Generate Build" | 0s | Button → spinner, text: "Architecting..." |
| Token check + deduction | 0–0.5s | (Happens server-side, user sees loading) |
| Knapsack optimizing | 0–2s | Right panel: animated gears / circuit animation |
| LLM evaluating | 2–8s | Right panel: "AI is reviewing your build..." |
| Done | — | Transition to Results display |
| Insufficient tokens | — | Show modal: "Not enough tokens. Buy a pack!" |
| Error | — | Show toast: "Something went wrong. Try again." |

---

## Section 10: Support System

### 3-Tier Model

| Tier | Channel | Details |
|---|---|---|
| **Tier 1** — Self Service | FAQ page | Common issues: payment failed, build didn't save |
| **Tier 2** — Ticket System | `/support/new` | User submits ticket → admin/support replies in thread → email notification on each reply |
| **Tier 3** — Direct Contact | Footer | Phone/WhatsApp for payment disputes |

### Ticket Priority Levels
`low` / `normal` / `high` (payment issues) / `urgent`

### Automated Notifications (via `notification_service.py`)

| Event | Channel |
|---|---|
| Account Creation | Email |
| Payment success | Email + optional SMS |
| Payment failed | Email with retry link |
| Token balance low (≤1) | Email reminder |
| Support reply received | Email notification |
| Build shared | Optional email |

---

## Section 11: Environment Setup

To run the full stack locally:

```bash
# Terminal 0 — Infrastructure (PostgreSQL + Redis)
cd "d:\project zenfa"
docker-compose up -d postgres redis

# Terminal 1 — Zenfa AI Engine (catalog + build solver)
cd "d:\Zenfa AI"
.\.venv\Scripts\activate
set GEMINI_API_KEY=your-key-here
uvicorn zenfa_ai.api.app:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — B2C Backend (auth, tokens, payments, support)
cd "d:\project zenfa"
docker-compose up backend_b2c
# Or manually:
# cd backend_b2c && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 3 — Frontend (Next.js)
cd "d:\project zenfa\frontend"
npm run dev
```

### Service Map

| Service | Port | Purpose |
|---|---|---|
| Next.js Frontend | `:3000` | UI, NextAuth, SSR |
| `backend_b2c` (FastAPI) | `:8001` | Auth, Tokens, Payments, Support, Referrals |
| Zenfa AI Engine (FastAPI) | `:8000` | Build solver, LLM evaluator |
| PostgreSQL | `:5432` | `zenfa_b2c` + `zenfa_catalog` databases |
| Redis | `:6379` | Session cache, rate limiting |

### Auth Credentials (Dev)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pclagbe.com` | `admin123` |

---

## Section 12: Recommended UI/UX Enhancements & Polish

### 12.1 Input Form Enhancements (Pre-Build)
- **Wizard/Multi-step Interface:** Break the input form into two steps to reduce cognitive load. 
  - *Step 1 (The Basics):* Budget Slider and Primary Purpose. 
  - *Step 2 (The Vibe):* Advanced preferences like Brands, RGB, and Form Factor.
- **Visual Tooltips & Icons:** Use recognizable icons for Form Factors (e.g., a large tower vs. a small cube) and actual brand logos (Intel, AMD, NVIDIA) instead of plain text options.
- **Use-Case Presets:** Reframe the "Purpose" buttons to ask "What are you trying to run?" with options like *Esports (Valorant)* or *AAA Titles (Cyberpunk)*. This maps transparently to the backend `purpose` but feels highly personalized.

### 12.2 Results Page Enhancements (Post-Build)
- **Estimated Performance Badges:** Add badges showing estimated 1080p performance (e.g., "Valorant: 240+ FPS" or "Cyberpunk: 60 FPS"). This is the most sought-after metric for PC gamers.
- **Compatibility Guarantee Badge:** Prominently display a green badge stating: *"100% Compatibility Guaranteed by Zenfa AI"* to alleviate beginners' fears of incompatible parts.
- **Visual Component Hierarchy:** Group "The Core" parts (CPU, GPU, RAM, Motherboard) in larger UI cards, with secondary parts (Storage, PSU, Case, Cooler) organized more compactly beneath them.
- **Vibe/Case Preview:** Display an abstract representation of the chosen build style (e.g., a glowing small chassis if they picked ITX + Heavy RGB) to help them visualize the end product.

### 12.3 Component Swapping UX (Tweaks)
- **Side-by-Side Diff View:** When swapping a component, show a direct comparison: e.g., switching an RTX 4060 to RX 7600 shows `Price: -৳2000`, `VRAM: Same`.
- **Domino Effect Warnings:** Show a clear tooltip if a swap forces other changes. For example: *"Note: Swapping to AMD will automatically adjust your Motherboard to match."*
- **Token Spend Animation:** Because swaps cost tokens, trigger a micro-animation (like a coin floating away with "-5 Tokens") upon confirming a swap. This ensures users are explicitly aware of the cost and prevents "surprise" balances.

### 12.4 Loading states & Polish
- **Skeleton Loaders over Spinners:** During the LLM evaluation phase (2-8 seconds), display a skeleton loader where PC component cards sequentially fade in.
- **Dynamic Status Updates:** Rotate engaging text under the loader, such as *"Analyzing bottleneck margins..."* or *"Sourcing best prices from StarTech & Ryans..."*, so the user feels valuable work is being done.
