# PC Lagbe? × Zenfa AI — UI Integration Guide

> This document maps every Zenfa AI engine field to a concrete UI element in the PC Lagbe? B2C website, provides the exact JSON payloads your frontend must send/receive, and details the full B2C feature set including token economy, gamification, and admin tooling.

---

## Design System & Visual Language

All UI screens follow a consistent **dark glassmorphic** aesthetic:

| Token | Value | Usage |
|---|---|---|
| **Background** | `#000000` (pure black) | Page canvas |
| **Primary Accent** | `#4f9e97` (teal) | Buttons, sliders, highlights, active states |
| **Primary Hover** | `#6ee1c9` (light teal) | Hover glow, link hover |
| **Glass Card** | `rgba(255,255,255,0.03)` + `border: 1px solid rgba(255,255,255,0.06)` + `backdrop-filter: blur(12px)` | All panels & containers |
| **Glass Card Glow** | Same as Glass Card + `box-shadow: 0 0 40px rgba(79,158,151,0.08)` | Primary/hero cards |
| **Surface** | `#111111` – `#0a0a0a` | Inputs, dropdowns, nested surfaces |
| **Text Primary** | `#ffffff` | Headings, values |
| **Text Secondary** | `#a3a3a3` (`neutral-400`) | Labels, descriptions |
| **Text Muted** | `#737373` (`neutral-500`) | Captions, hints |
| **Danger** | `#ef4444` | Errors, urgent badges |
| **Warning** | `#eab308` (yellow-500) | Leaderboard, gamification accents |
| **Font** | System sans-serif / Inter | All text |
| **Border Radius** | `12px` (cards), `20px` (hero), `9999px` (pills/badges) | Consistent rounding |
| **3D Background** | Spline scene (dark vortex/tunnel) | `/build` page, full-bleed behind form |

**Key Principles:**
- Cards float over a pure black canvas with subtle glow borders
- No sharp whites — everything is muted, with teal as the only vivid color
- Micro-animations on hover (scale, glow, color shift)
- `ShadowOverlay` gradient vignette on dashboard pages
- Spline 3D animated background on the `/build` page only

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

## Section 1: Build Page — Input Form (`/build`)

### Full-Page Layout

The `/build` page is a full-bleed dark canvas with an animated **Spline 3D vortex** background. Content is centered with a two-column glass layout:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  SPLINE 3D BACKGROUND  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                                                       │
│  ┌── NAVBAR (fixed, bg-black/80 blur) ──────────────────────────────┐  │
│  │  🔲 PC Lagbe?              PC Builder  Components  Login  [Get…]│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                   Build Your  ✦ Dream PC ✦                            │
│            Define your budget and needs. AI will handle the rest.     │
│                                                                       │
│  ┌─ GLASS-CARD-GLOW (left) ──────┐  ┌─ GLASS-CARD (right) ─────────┐ │
│  │                                │  │                               │ │
│  │  Budget                ৳80,000 │  │    ┌─────────────────────┐    │ │
│  │  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░  │  │    │    🧪 (flask icon)  │    │ │
│  │  ৳30k ──────────────── ৳500k+  │  │    └─────────────────────┘    │ │
│  │                                │  │                               │ │
│  │  Primary Use                   │  │     Ready to Architect        │ │
│  │  ┌──────────┐ ┌──────────────┐ │  │     Configure preferences     │ │
│  │  │▌Gaming ▌ │ │  Workstation │ │  │     on the left to generate   │ │
│  │  └──────────┘ └──────────────┘ │  │     a tailored PC build.      │ │
│  │  ┌──────────┐ ┌──────────────┐ │  │                               │ │
│  │  │ Editing  │ │    Office    │ │  │  (this panel transitions to   │ │
│  │  └──────────┘ └──────────────┘ │  │   the RESULTS view after AI   │ │
│  │                                │  │   generation completes)       │ │
│  │  ▼ Advanced Preferences        │  │                               │ │
│  │  (collapsed by default)        │  │                               │ │
│  │                                │  │                               │ │
│  │  ┌────────────────────────────┐│  │                               │ │
│  │  │   ✦  Generate Build  ✦    ││  │                               │ │
│  │  └────────────────────────────┘│  │                               │ │
│  └────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Style Notes

| Element | Style |
|---|---|
| Left card | `glass-card-glow` — the primary interaction surface, warm teal glow |
| Right card | `glass-card` — dashed border when empty (placeholder state), solid when showing results |
| Budget slider track | `bg-neutral-800` rounded bar, filled portion is `bg-gradient-to-r from-[#4f9e97] to-[#6ee1c9]` |
| Budget value | Teal bold text `#4f9e97`, right-aligned |
| Purpose buttons | 2×2 grid, `border-neutral-800 bg-neutral-900/50` default, active = `border-[#4f9e97] bg-[#4f9e97]/10 text-white` |
| Generate button | Full-width, `btn-primary` — solid teal bg with hover glow, `py-4 text-lg` |
| Page title | `text-4xl md:text-5xl font-bold`, "Dream PC" part uses `text-gradient-primary` (teal gradient) |

### Input → Engine Field Mapping

| UI Element | Status | Engine Field |
|---|---|---|
| Budget slider (single thumb) | ✅ Exists | `budget_min` / `budget_max` |
| Primary Use (4 buttons) | ⚠️ Rename "Workstation" → "General" | `purpose` |
| CPU Brand preference | ❌ Missing — add in Advanced panel | `preferences.prefer_cpu_brand` |
| GPU Brand preference | ❌ Missing — add in Advanced panel | `preferences.prefer_gpu_brand` |
| Include Monitor toggle | ❌ Missing — add in Advanced panel | `preferences.include_monitor` |
| Form Factor selector | ❌ Missing — add in Advanced panel | `preferences.form_factor` |
| RGB Priority selector | ❌ Missing — add in Advanced panel | `preferences.rgb_priority` |
| Min Storage selector | ❌ Missing — add in Advanced panel | `preferences.min_storage_gb` |
| Wi-Fi toggle | ❌ Missing — add in Advanced panel | `preferences.prefer_wifi` |

---

### 1.1 Budget Slider

**Engine fields:** `budget_min` (int), `budget_max` (int) — both in BDT (৳)

**Current:** Single slider. Sends `budget_min = budget_max = sliderValue`.  
**Optional upgrade:** Dual-thumb range slider (e.g., ৳60k–৳65k).

```
Range: ৳30,000 → ৳500,000
Step:  ৳1,000  (current)  →  consider ৳5,000 for cleaner UX
```

---

### 1.2 Purpose Buttons

**Engine field:** `purpose` — strict enum: `"gaming"` | `"editing"` | `"office"` | `"general"`

**Current UI labels:** Gaming, Workstation, Editing, Office  
**Fix:** Rename **"Workstation"** → **"General"**, OR map `"workstation"` → `"general"` in JS.

Buttons are a 2×2 grid. Selected state has a teal left-border glow and teal-tinted bg.

---

### 1.3 Advanced Preferences (Collapsible)

A `▼ Advanced Preferences` toggle below Purpose. When expanded, shows preferences inside the same glass card with subtle `bg-black/30` inset sections:

#### CPU Brand — Segmented Control (dark pills)
```
[ Intel ]  [ AMD ]  [ No Preference ]
```
→ `"prefer_cpu_brand": "Intel"` | `"AMD"` | `null`

#### GPU Brand — Segmented Control
```
[ NVIDIA ]  [ AMD ]  [ Intel ]  [ No Preference ]
```
→ `"prefer_gpu_brand": "NVIDIA"` | `"AMD"` | `"Intel"` | `null`

#### Form Factor — Dark Dropdown
```
[ Standard (ATX)  ▾ ]     bg-black/50, border-neutral-700
  • Standard (ATX)
  • Compact (mATX)
  • Tiny (ITX)
```
→ `"form_factor": "ATX"` | `"mATX"` | `"ITX"` | `null`

#### RGB Lighting — Segmented Control
```
[ Heavy RGB ]  [ Some ]  [ None ]
```
→ `"rgb_priority": "high"` | `"medium"` | `"low"` — Default: `"medium"`

#### Min Storage — Dark Dropdown
→ `"min_storage_gb": 256` | `512` | `1000` | `2000`

#### Toggles (dark toggle switches with teal active state)
```
○ Include Monitor in Budget       →  "include_monitor": true/false
○ Must have Wi-Fi                  →  "prefer_wifi": true/false
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

The results **replace the right-hand panel** on the `/build` page (the "Ready to Architect" placeholder transitions to the results via `AnimatePresence`). The left form panel stays visible.

```
┌─ RIGHT PANEL (glass-card, replaces placeholder) ──────────────────────┐
│                                                                       │
│  ┌─ HEADER ─────────────────────────────────────────────────────────┐  │
│  │  Recommended Build                          Total: ৳63,500     │  │
│  │  Optimized for gaming                 Remaining: ৳1,500        │  │
│  └──────────────────── border-b border-neutral-800 ─────────────────┘  │
│                                                                       │
│  ┌─ SCORE BANNER (glass-card-glow, teal border-l-4) ───────────────┐  │
│  │  ┌───────┐                                                      │  │
│  │  │ 9.2   │   "A balanced 1080p gaming build with future-proof   │  │
│  │  │ /10   │    AM5 platform and DLSS-capable GPU."               │  │
│  │  └───────┘   ▓▓▓ ▓▓▓ ▓▓░ ▓░░ ▓░░  (5 mini score bars)         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ COMPONENT ROW (hover:bg-white/5, group transition) ────────────┐  │
│  │  ┌────┐                                                         │  │
│  │  │ CP │  CPU · AMD Ryzen 5 7600                    ৳23,000     │  │
│  │  │ U  │  "6 cores on future-proof AM5 socket"       [Swap]     │  │
│  │  └────┘  StarTech  [Buy →]                                      │  │
│  │  ──────────────────────────── thin separator ───────────────     │  │
│  │  ┌────┐                                                         │  │
│  │  │ GP │  GPU · NVIDIA RTX 4060                     ৳38,000     │  │
│  │  │ U  │  "Handles modern games with DLSS 3"         [Swap]     │  │
│  │  └────┘  Ryans  [Buy →]                                         │  │
│  │                                                                 │  │
│  │  ... RAM, Storage, PSU, Case, Cooler, Motherboard ...           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ INSIGHTS (glass-card bg-neutral-900/50) ───────────────────────┐  │
│  │  ⚖️ Trade-offs: "Opted for 16GB RAM to stay in budget."         │  │
│  │  🔮 Upgrade Path: "Add another 16GB RAM stick later."           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ ACTION BAR ────────────────────────────────────────────────────┐  │
│  │  [ ✦ Save Build ✦ ]   [ ↓ PDF ]   [ 🔗 Share ]                 │  │
│  │     btn-secondary        icon btn     icon btn teal             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

### Style Details

| Element | Style |
|---|---|
| Component type badge | `w-10 h-10 rounded-md bg-neutral-800`, shows 2-letter abbreviation (CP, GP, RA, etc.), on hover → `bg-[#4f9e97]/20 text-[#4f9e97]` |
| Component name | `font-medium text-sm text-neutral-200` |
| AI reasoning line | `text-xs text-neutral-500` italic, below the name |
| Price | `font-mono text-sm text-neutral-400`, right-aligned |
| [Swap] button | Small pill, `text-[#4f9e97] border border-[#4f9e97]/30 bg-[#4f9e97]/10 rounded-lg px-3 py-1` |
| [Buy →] link | `text-xs text-neutral-500 hover:text-[#4f9e97]`, opens vendor URL |
| PDF button | Icon-only, `bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl` with `<Download>` icon |
| Save button | `btn-secondary` — outlined pill |
| Share button | Teal-tinted icon button with `<Share2>` icon |
| Score ring | Circular progress indicator, teal fill, large number in center |
| Score breakdown | 5 tiny horizontal bars with labels on hover |

**Field → UI Mapping:**

| Response Field | UI Element |
|---|---|
| `quality.score` | Score ring / badge in score banner |
| `quality.scores_breakdown.*` | 5 mini teal progress bars |
| `explanation.summary` | Teal-bordered quote text |
| `build.components[]` | Component card rows (scrollable) |
| `*.vendor_url` | "Buy →" link on each card |
| `explanation.per_component.*` | Subtitle text on each card |
| `explanation.trade_offs` | Insights banner — ⚖️ icon |
| `explanation.upgrade_path` | Insights banner — 🔮 icon |
| `build.total_price` | Header right-side, `text-2xl font-bold text-[#4f9e97]` |
| `build.remaining_budget` | Small badge, `text-xs text-neutral-500` |
| **User's `token_balance`** | **Shown in Navbar or header as a teal pill** |

---

## Section 4: Component Swap Flow (Tweaks)

When a user clicks **[Swap]** on a component:

1. A **glass modal** slides up (dark overlay + `glass-card` centered, `backdrop-blur`) showing AI-suggested alternatives.
2. Also shows a "Search All Components" search bar that queries `zenfa_catalog`.
3. When user picks a replacement, `backend_b2c` constructs a **new `BuildRequest`** with the swapped component locked in and calls `/internal/build` again.
4. **Token deduction:** Each tweak costs **5 tokens** (unless free tweaks remain).
5. On confirm, a micro-animation plays: a teal coin floats away with "-5 Tokens".

### Swap Modal Layout

```
┌─ MODAL (glass-card, centered, max-w-lg) ─────────────────────┐
│                                                               │
│  Swap CPU                                            [ ✕ ]   │
│  Current: AMD Ryzen 5 7600 · ৳23,000                         │
│                                                               │
│  ┌─ SEARCH ─────────────────────────────────────────────────┐ │
│  │  🔍  Search components...     bg-black/50 border-neutral │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  AI Suggestions                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Intel Core i5-13400F    ৳21,000   Price: -৳2,000  [▶]  │ │
│  │  AMD Ryzen 7 5700X       ৳25,500   Price: +৳2,500  [▶]  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ⚡ This swap will cost 5 tokens                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

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

Full-bleed black canvas with `ShadowOverlay` gradient vignette. All cards use `glass-card` or `glass-card-glow`.

```
┌─ PAGE: /dashboard ──────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░  ShadowOverlay (subtle gradient vignette)  ░░░░░░░░  │
│                                                                        │
│  My Dashboard                                      [ ✦ New Build ✦ ]   │
│                                                                        │
│  ┌─ GLASS-CARD-GLOW (col-span-2) ──────────┐  ┌─ GLASS-CARD ────────┐ │
│  │  CURRENT BALANCE (small caps, neutral)   │  │  QUICK STATS        │ │
│  │                                          │  │  border-l-4 teal    │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓  20  Tokens               │  │                     │ │
│  │  (text-5xl extrabold teal)               │  │  0  Saved Builds    │ │
│  │  "You have enough for 2 Full AI Builds"  │  │  3  Support →       │ │
│  │                                          │  │                     │ │
│  │  [Get More Tokens]  [★ View Leaderboard] │  │                     │ │
│  │   teal outlined btn   yellow outlined    │  │                     │ │
│  └──────────────────────────────────────────┘  └─────────────────────┘ │
│                                                                        │
│  ┌─ GLASS-CARD (teal border-l, subtle teal glow bg) ──────────────────┐│
│  │  ┌──────────┐                                                      ││
│  │  │ 🎁 QR    │  Earn Free Tokens                                    ││
│  │  │  icon    │  Share your referral link with friends. When they     ││
│  │  └──────────┘  sign up, you both receive 10 bonus tokens!          ││
│  │                                                                    ││
│  │  ┌──────────────────────────────────────────────────┐  ┌────────┐  ││
│  │  │  pclagbe.com/register?ref=H2K56XBT  (font-mono) │  │  Copy  │  ││
│  │  │  bg-black/50, border-neutral-700, rounded-xl     │  │  Link  │  ││
│  │  └──────────────────────────────────────────────────┘  └────────┘  ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                        │
│  Recent Builds                                                         │
│  ┌─ EMPTY STATE (dashed border, border-neutral-800) ──────────────────┐│
│  │  📦 (icon, neutral-700)                                            ││
│  │  "You haven't generated any saved builds yet."                     ││
│  │   Start your first build  (teal link)                              ││
│  └────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

### Leaderboard (`/dashboard/leaderboard`)

```
┌─ PAGE: /dashboard/leaderboard ─────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░  ShadowOverlay + yellow blur glow  ░░░░░░░░░░░░░░░░  │
│                                                                        │
│  [← Back]   Top Promoters  🏆                                         │
│             The most active community members.                         │
│                                                                        │
│  ┌─ GLASS-CARD (border-yellow-500/20, shadow yellow glow) ────────────┐│
│  │  ┌ HEADER: gradient yellow/10 → transparent, border-b white/5 ──┐  ││
│  │  │  👥 Hall of Fame                         [ LIVE UPDATES ]    │  ││
│  │  └──────────────────────────────────────────────────────────────┘  ││
│  │                                                                    ││
│  │  ┌─ ROW (bg-gradient from-white/3, top 3 highlighted) ──────────┐ ││
│  │  │  🏆  #1   Sultan Rafi        sul***@gmail.com     12 Invites │ ││
│  │  │       MVP badge (yellow bg, black text, tiny pill)            │ ││
│  │  ├───────────────── divide-y divide-white/5 ─────────────────────┤ ││
│  │  │  🥈  #2   Ahmed Khan         ahm***@yahoo.com     8 Invites │ ││
│  │  ├──────────────────────────────────────────────────────────────┤ ││
│  │  │  🥉  #3   Test User          tes***@example.com   5 Invites │ ││
│  │  ├──────────────────────────────────────────────────────────────┤ ││
│  │  │   4   Anonymous Builder     ano***@mail.com       2 Invites │ ││
│  │  └──────────────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                        │
│  Want to see your name here? Go to Dashboard and share your link!      │
└────────────────────────────────────────────────────────────────────────┘
```

### Shared Build Page (`/build/[slug]`)

```
┌─ PAGE: /build/{slug} ──────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░  Spline 3D background  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                        │
│                 [ Shared Build ]  (teal pill badge)                    │
│            Gaming  ✦ Beast ✦   (text-4xl bold, gradient)              │
│            Total Value: ৳85,000  (text-neutral-400)                   │
│                                                                        │
│  ┌─ GLASS-CARD (max-w-3xl, centered, shadow-lg) ──────────────────────┐│
│  │  Components                          [ ↓ PDF ]  [ 🔗 Share ]      ││
│  │  ──────────────── border-b ─────────────────────                    ││
│  │                                                                    ││
│  │  ┌────┐  CPU · AMD Ryzen 5 5600X                      ৳17,500    ││
│  │  │ CP │  bg-black/40 border-white/5 hover:bg-white/5               ││
│  │  └────┘                                                            ││
│  │  ┌────┐  GPU · Gigabyte RTX 3060 12GB                 ৳38,000    ││
│  │  │ GP │                                                            ││
│  │  └────┘                                                            ││
│  │  ... more components ...                                           ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                        │
│  Want to build something similar?                                      │
│  [ ✦ Create Your Own PC ✦ ]  (btn-primary, links with ?ref=CODE)      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Admin Dashboard (`/admin`)

The admin panel is a **protected section of the same Next.js app**, guarded by `role === 'admin'`.

```
┌─ PAGE: /admin ─────────────────────────────────────────────────────────┐
│                                                                        │
│  Analytics Overview  (text-3xl bold)                                   │
│                                                                        │
│  ┌─ GRID: 4 stat cards ──────────────────────────────────────────────┐ │
│  │ ┌─ GLOW ────────┐ ┌─ blue-l ───────┐ ┌─ yellow-l ──────┐ ┌─ red ┐│ │
│  │ │ ৳ icon        │ │ 👥 icon        │ │ 🕐 icon         │ │ ⚠ ic ││ │
│  │ │               │ │                │ │                  │ │      ││ │
│  │ │  ৳12,500      │ │  247           │ │  4               │ │  6   ││ │
│  │ │  Total Revenue│ │  Registered    │ │  Pending         │ │ Open ││ │
│  │ │               │ │  Users         │ │  Payments        │ │ Tick ││ │
│  │ └───────────────┘ └────────────────┘ └──────────────────┘ └──────┘│ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─ 2-COLUMN GRID ───────────────────────────────────────────────────┐ │
│  │ ┌─ GLASS-CARD ──────────────┐  ┌─ GLASS-CARD (yellow glow) ─────┐│ │
│  │ │  Admin Tasks              │  │  👥 Top Referrers  [MVP BOARD] ││ │
│  │ │  • Review Transactions    │  │                                ││ │
│  │ │  • Check Support Tickets  │  │  #1  Sultan Rafi    12 invites ││ │
│  │ │  • Users & Tokens mgmt   │  │  #2  Ahmed Khan      8 invites ││ │
│  │ └───────────────────────────┘  │  #3  Test User       5 invites ││ │
│  │                                │  (No referrers yet.)           ││ │
│  │                                └────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

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
| User clicks "Generate Build" | 0s | Button inner text → `<Spinner />` + "Analyzing Prices..." (white spinner, 5×5) |
| Token check + deduction | 0–0.5s | Server-side, user sees the button spinner continue |
| Knapsack optimizing | 0–2s | Right panel: skeleton loader — component card placeholders fade in one by one |
| LLM evaluating | 2–8s | Right panel: rotating status text: *"Analyzing bottleneck margins..."* → *"Sourcing best prices..."* → *"AI is reviewing your build..."* |
| Done | — | `AnimatePresence` fades in Results panel (scale 0.95 → 1, opacity 0 → 1) |
| Insufficient tokens | — | Glass modal slides up: "Not enough tokens" + [Get More Tokens] button |
| Error | — | Red banner with ⚠️ icon: `bg-red-900/20 border-red-500/30 text-red-200` |

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

## Section 12: UX Enhancement Roadmap

### 12.1 Input Form
- **Wizard/Multi-step:** Step 1 → Budget + Purpose (current view). Step 2 → expands the Advanced Preferences panel with brand logos (Intel, AMD, NVIDIA) instead of plain text.
- **Game-specific Presets:** Reframe "Purpose" as "What are you trying to run?" → *Esports (Valorant)* or *AAA Titles (Cyberpunk)*. Maps to `purpose` enum internally.
- **Form Factor Icons:** Show mini tower vs. small cube illustrations for ATX/mATX/ITX.

### 12.2 Results Page
- **Performance Badges:** Teal-bordered pills: "Valorant: 240+ FPS" or "Cyberpunk: 60 FPS" — displayed beside the score ring.
- **Compatibility Guarantee:** Green `glass-card` badge: *"100% Compatibility Guaranteed by Zenfa AI"* with a shield icon.
- **Component Hierarchy:** "The Core" (CPU, GPU, RAM, MB) get larger cards with expanded specs. Secondary parts (Storage, PSU, Case, Cooler) collapse into a compact grid below.

### 12.3 Component Swapping
- **Diff View:** Side-by-side in the swap modal: `Price: -৳2,000`, `Cores: Same`, `VRAM: +4GB` — with green/red delta badges.
- **Domino Warnings:** Tooltip on swap confirm: *"Swapping to AMD will automatically adjust your Motherboard."* — uses the existing teal info banner style.
- **Token Animation:** Floating "-5 Tokens" coin animation on swap confirm.

### 12.4 Loading & Polish
- **Skeleton Loaders:** During LLM phase, component card placeholders pulse in one-by-one (dark skeleton on `bg-neutral-900`).
- **Rotating Status Text:** Cycle through: *"Analyzing bottleneck margins..."* → *"Sourcing best prices from StarTech & Ryans..."* → *"AI is finalizing your build..."*
