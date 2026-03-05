# PC Lagbe? — Landing Page Content Design

> This document defines the additional content sections to be added to the landing page (`page.tsx`). The existing **TakaHero** 3D animation and **Features bento grid** are preserved exactly as-is.

---

## Current Page Structure (Keep As-Is)

| # | Section | Status |
|---|---|---|
| 1 | **Navbar** (fixed, glassmorphic) | ✅ Keep |
| 2 | **TakaHero** (3D Taka coins + particle beam) | ✅ Keep — do not touch |
| 3 | **Features Bento Grid** (AI Build, Price, Compat, Swap) | ✅ Keep |
| 4 | **CTA "Ready to Build?"** (budget slider preview) | ✅ Keep |
| 5 | Footer (one-liner) | ⚠️ **Replace** with full footer |

---

## New Sections to Add (in scroll order)

Insert these **between the Features Bento Grid and the CTA section**. The final scroll order will be:

1. TakaHero
2. Features Bento Grid
3. **NEW — "How It Works" (3-step flow)**
4. **NEW — "Trusted Vendors" (vendor marquee)**
5. **NEW — "Top Builds" (community showcase)**
6. **NEW — "Featured Offers" (vendor deals)**
7. **NEW — "Why PC Lagbe?" (value props)**
8. **NEW — "What Builders Say" (sliding testimonials)**
9. **NEW — "Tech Headlines" (scrolling news ticker)** ← TV-style breaking news bar
10. **NEW — "Live Activity Feed" (social proof ticker)** ← skeleton experiment
11. **NEW — "Upcoming Features" (roadmap teaser)**
12. **NEW — "Earn While You Share" (referral teaser)**
13. CTA "Ready to Build?"
14. **NEW — Full Footer**

---

## Section L: "Tech Headlines" — Breaking News Ticker

**Purpose:** A horizontal scrolling news bar — exactly like the ticker at the bottom of a TV news channel — showing the latest PC/tech headlines. Drives users to the `/breaking` page.

```
┌─ SECTION: Tech Headlines ─────────────────────────────────────────────────┐
│  bg-neutral-950, border-y border-[#4f9e97]/20, py-3                       │
│                                                                           │
│  ┌─ LEFT BADGE ─┐  ┌─ SCROLLING MARQUEE (right-to-left) ─────────────┐  │
│  │  ⚡ BREAKING  │  │                                                  │  │
│  │  (bg-red-500  │  │  NVIDIA RTX 5070 drops to ৳65k at StarTech ◆   │  │
│  │   text-white  │  │  AMD announces Ryzen 9000X3D release date ◆    │  │
│  │   font-bold)  │  │  DDR5 prices hit all-time low in Bangladesh ◆  │  │
│  │              │  │  PC Lagbe reaches 500+ builds generated ◆       │  │
│  └──────────────┘  │  RTX 4060 vs RX 7600: Our AI's verdict is... ◆ │  │
│                     │  (infinite scroll, same as Trusted Vendors)     │  │
│                     └────────────────────────────────────────────────────┘  │
│                                                                           │
│                                    [ Read More → /breaking ]  (text link) │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content
- **Badge:** Fixed-position red `⚡ BREAKING` label on the left side, always visible.
- **Headlines:** 4–6 short one-liners scrolling right-to-left in an infinite CSS marquee (same technique as Section B Trusted Vendors).
- **Separator:** Teal diamond `◆` between each headline.
- **Link:** Small "Read More →" text link on the right side, goes to `/breaking`.

### Style Notes
- **Bar height:** Compact — `py-3`, single line of text.
- **Badge:** `bg-red-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-sm` — stays fixed on the left.
- **Headline text:** `text-sm text-neutral-400 font-medium`, with keywords bolded in white.
- **Edge masks:** Same CSS `mask-image` gradient fade as Section B, so text fades in/out at the edges.
- **Speed:** Slightly faster than the vendor marquee — headlines should feel urgent.
- **Hover:** Pause on hover, hovered headline highlights in white.

---

## Section A: "How It Works" — 3-Step Horizontal Flow

**Purpose:** Show first-time visitors the dead-simple process in 3 visual steps.

```
┌─ SECTION: How It Works ───────────────────────────────────────────────────┐
│  bg-black, subtle teal radial glow top-center                             │
│                                                                           │
│                   How It Works                                            │
│          From budget to build in under 60 seconds.                       │
│                                                                           │
│  ┌─ STEP 1 ──────────┐  ┌─ STEP 2 ──────────┐  ┌─ STEP 3 ──────────┐   │
│  │                    │  │                    │  │                    │   │
│  │    ┌──────────┐    │  │    ┌──────────┐    │  │    ┌──────────┐    │   │
│  │    │ 01       │    │  │    │ 02       │    │  │    │ 03       │    │   │
│  │    │ teal num │    │  │    │ teal num │    │  │    │ teal num │    │   │
│  │    └──────────┘    │  │    └──────────┘    │  │    └──────────┘    │   │
│  │                    │  │                    │  │                    │   │
│  │  Set Your Budget   │  │  AI Architects    │  │  Buy with          │   │
│  │  & Preferences     │  │  Your Build       │  │  Confidence        │   │
│  │                    │  │                    │  │                    │   │
│  │  Pick your budget  │  │  Our AI analyzes  │  │  Get direct links  │   │
│  │  range, use case,  │  │  100+ parts for   │  │  to StarTech,      │   │
│  │  and optional      │  │  compatibility,   │  │  Ryans, etc. with  │   │
│  │  brand prefs.      │  │  performance &    │  │  real prices. Or   │   │
│  │                    │  │  value. Done in    │  │  export as PDF.    │   │
│  │                    │  │  seconds.          │  │                    │   │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘   │
│                                                                           │
│  ─ ─ ─ ─ ─ ─ ► ─ ─ ─ ─ ─ ─ ► ─ ─ ─ ─ ─ ─ ►  (dashed line connector)  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content

| Step | Number | Title | Description |
|---|---|---|---|
| 1 | `01` | **Set Your Budget & Preferences** | Pick your budget range, use case (Gaming, Editing, Office), and optional brand preferences. Takes 10 seconds. |
| 2 | `02` | **AI Architects Your Build** | Our AI analyzes 100+ components across compatibility, performance scores, and current prices. You get a full build in seconds — not hours. |
| 3 | `03` | **Buy with Confidence** | Every part links directly to StarTech, Ryans, TechLand, and more. Download a PDF to take to the shop. Swap any part you don't like instantly. |

### Style Notes
- Step cards: `glass-card` with `hover:scale-1.02`
- Step numbers: Large `text-6xl font-black text-[#4f9e97]/20` watermark behind the title
- Connecting line: Dashed teal line with animated dots flowing left-to-right (CSS animation)
- `motion.div` with `whileInView` stagger (0.15s between cards)
- On mobile: vertical stack, connecting line becomes vertical

---

## Section B: "Trusted Vendors" — Continuous Marquee

**Purpose:** Build credibility by showing the actual Bangladeshi retailers whose prices we aggregate. Designed like a continuous news ticker.

```
┌─ SECTION: Trusted Vendors ────────────────────────────────────────────────┐
│  bg-black, border-y border-white/5, py-6                                  │
│                                                                           │
│  ┌─ INFINITE SCROLL MARQUEE ──────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │   StarTech ◆ Ryans ◆ TechLand ◆ Skyland ◆ UCC ◆ StarTech ◆ Rya...  │   │
│  │   (scrolling continuously right-to-left, CSS animation)            │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content
- **Text/Logos:** "StarTech", "Ryans", "TechLand", "Skyland", "UCC" separated by a glowing teal dot or diamond (`◆`).
- **Style:** `text-2xl font-bold text-neutral-600 uppercase tracking-widest`
- **Animation:** A CSS infinite marquee (`animate-marquee`). When hovering over the marquee, the animation pauses (`hover:animate-pause`) and the hovered vendor name lights up in full white with a teal glow.
- **Edges:** Use a CSS mask-image (`mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent)`) to make the text gracefully fade out at the left and right edges of the screen, just like a professional TV news ticker.

---

## Section C: "Why PC Lagbe?" — Value Proposition Grid

**Purpose:** Address the top 4 pain points of Bangladeshi PC buyers and position PC Lagbe as the solution.

```
┌─ SECTION: Why PC Lagbe? ──────────────────────────────────────────────────┐
│  bg-black, large teal blur glow off-center (decorative)                   │
│                                                                           │
│                 Why Thousands Choose PC Lagbe?                            │
│                 (or "The PC Builder Bangladesh Needed")                   │
│                                                                           │
│  ┌─ 2x2 GRID ────────────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ glass-card ──────────────┐  ┌─ glass-card ──────────────────┐ │   │
│  │  │  🧠 icon (teal)           │  │  💰 icon (teal)               │ │   │
│  │  │                           │  │                                │ │   │
│  │  │  No PC Knowledge Needed   │  │  Never Overpay Again          │ │   │
│  │  │                           │  │                                │ │   │
│  │  │  Don't know the diff      │  │  We compare prices across     │ │   │
│  │  │  between DDR4 and DDR5?   │  │  5+ retailers in real-time.   │ │   │
│  │  │  No problem. Tell us      │  │  The average user saves       │ │   │
│  │  │  your budget and what     │  │  ৳3,000–৳8,000 per build      │ │   │
│  │  │  you'll use it for.       │  │  vs. going to one shop.       │ │   │
│  │  │  AI handles the rest.     │  │                                │ │   │
│  │  └───────────────────────────┘  └────────────────────────────────┘ │   │
│  │                                                                    │   │
│  │  ┌─ glass-card ──────────────┐  ┌─ glass-card ──────────────────┐ │   │
│  │  │  ✅ icon (teal)           │  │  ⚡ icon (teal)               │ │   │
│  │  │                           │  │                                │ │   │
│  │  │  100% Compatible.         │  │  Build in 60 Seconds,         │ │   │
│  │  │  Guaranteed.              │  │  Not 6 Hours.                 │ │   │
│  │  │                           │  │                                │ │   │
│  │  │  Every build is checked   │  │  No more opening 15 tabs      │ │   │
│  │  │  for socket match, RAM    │  │  and comparing specs. Our     │ │   │
│  │  │  type, PSU wattage, and   │  │  AI gives you a complete,     │ │   │
│  │  │  case clearance. Zero     │  │  scored build instantly.      │ │   │
│  │  │  guesswork.               │  │  Then swap any part you       │ │   │
│  │  │                           │  │  don't like.                  │ │   │
│  │  └───────────────────────────┘  └────────────────────────────────┘ │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content

| # | Icon | Title | Description |
|---|---|---|---|
| 1 | 🧠 | **No PC Knowledge Needed** | Don't know the difference between DDR4 and DDR5? No problem. Just tell us your budget and what you'll use it for. AI handles the rest. |
| 2 | 💰 | **Never Overpay Again** | We compare prices across 5+ retailers in real-time. The average user saves ৳3,000–৳8,000 per build vs. going to one shop. |
| 3 | ✅ | **100% Compatible. Guaranteed.** | Every build is validated for socket match, RAM type, PSU wattage, and case clearance. Zero guesswork, zero returns. |
| 4 | ⚡ | **Build in 60 Seconds, Not 6 Hours** | No more opening 15 browser tabs and comparing specs. Our AI delivers a complete, scored build instantly. Swap any part you don't like. |

### Style Notes
- Cards: `glass-card p-8` with `whileHover={{ scale: 1.02 }}`
- Icons: `w-12 h-12 rounded-xl bg-[#4f9e97]/10 text-[#4f9e97]` (use Lucide icons: `Brain`, `Banknote`, `ShieldCheck`, `Zap`)
- Large floating teal blur behind the grid (decorative, `pointer-events-none`)

---

## Section D: "What Builders Say" — Sliding Testimonials

**Purpose:** Social proof. Show curated quotes from beta testers or placeholder reviews in an interactive sliding format.

```
┌─ SECTION: What Builders Say ──────────────────────────────────────────────┐
│  bg-black                                                                 │
│                                                                           │
│                   What Builders Are Saying                                │
│                                                                           │
│   ⟨   ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐   ⟩  │
│       │  ★★★★★             │ │  ★★★★★             │ │  ★★★★★             │      │
│       │                   │ │                   │ │                   │      │
│       │  "I built a full  │ │  "Never thought   │ │  "Saved me ৳5,000 │      │
│       │  gaming rig in    │ │  AI could pick    │ │  compared to what │      │
│       │  under 2 minutes. │ │  better parts     │ │  the shop guy     │      │
│       │  Every part was   │ │  than I could.    │ │  quoted me."      │      │
│       │  compatible."     │ │  Seriously         │ │                   │      │
│       │                   │ │  impressed."      │ │                   │      │
│       │  — Rafid A.       │ │  — Tanha S.       │ │  — Mahir K.       │      │
│       │   Dhaka           │ │   Chittagong      │ │   Sylhet          │      │
│       └───────────────────┘ └───────────────────┘ └───────────────────┘      │
│                                                                           │
│                         ○   ●   ○   ○  (pagination dots)                  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content

| # | Quote | Name | Location | Rating |
|---|---|---|---|---|
| 1 | "I built a full gaming rig in under 2 minutes. Every part was compatible and the prices were the lowest I found anywhere." | Rafid A. | Dhaka | ★★★★★ |
| 2 | "Never thought AI could pick better parts than I could. The score breakdown and trade-off explanations are seriously impressive." | Tanha S. | Chittagong | ★★★★★ |
| 3 | "Saved me ৳5,000 compared to what the shop guy at IDB quoted me. Showed him the PDF and he matched the price." | Mahir K. | Sylhet | ★★★★★ |
| 4 | "Best part? I had no idea what RAM to pick. The AI explained why it chose DDR5 instead of DDR4 for my use case." | Nusrat J. | Rajshahi | ★★★★★ |

### Style Notes
- **Layout:** A horizontal sliding carousel (e.g., using `embla-carousel-react` or Framer Motion drag).
- **Controls:** Left/Right arrow buttons (`⟨` `⟩`) floating outside the cards, plus pagination dots at the bottom. The active dot is teal (`bg-[#4f9e97]`), inactive dots are gray (`bg-neutral-800`).
- **Cards:** `glass-card p-8 min-w-[320px] max-w-[400px]` with subtle border, on hover glow. Cards smoothly slide left/right on interaction.
- **Stars:** `text-yellow-500` filled stars.
- **Quote text:** `text-neutral-300 italic text-lg leading-relaxed`.
- **Name:** `text-white font-bold`, Location: `text-neutral-500 text-sm`.
- **Responsive:** On desktop, show 3 cards. On tablet, 2. On mobile, 1 centered card.

---

## Section K: "Upcoming Features" — Roadmap Teaser

**Purpose:** Show users that the platform is actively evolving and tease high-value future additions to keep them coming back.

```
┌─ SECTION: What's Next ────────────────────────────────────────────────────┐
│  bg-gradient-to-b from-black to-neutral-900/20                            │
│                                                                           │
│              🚀 Coming Soon to PC Lagbe                                  │
│              We're building the ultimate PC toolkit.                      │
│                                                                           │
│  ┌─ ROADMAP GRID (2 Columns) ────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ FEATURE SKELETON ─────┐  ┌─ UPCOMING FEATURE ─────┐            │   │
│  │  │  glass-card-glow       │  │  glass-card            │            │   │
│  │  │                        │  │                        │            │   │
│  │  │  📈 Historical Price   │  │  📱 Push Notifications │            │   │
│  │  │     Graphs             │  │     for Price Drops    │            │   │
│  │  │                        │  │                        │            │   │
│  │  │  [ SKELETON GRAPH ]    │  │  Track any build and   │            │   │
│  │  │  (animated wavy line   │  │  get alerted the       │            │   │
│  │  │   showing price trend  │  │  second prices fall.   │            │   │
│  │  │   over 3 months)       │  │                        │            │   │
│  │  │                        │  │  [ Notify Me ]         │            │   │
│  │  │  Never guess if it's   │  │                        │            │   │
│  │  │  a good time to buy.   │  │                        │            │   │
│  │  └────────────────────────┘  └────────────────────────┘            │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content (The "Coming Soon" Cards)

**1. Historical Price Graphs (The Hero Feature)**
- **Visual:** A slick, animated line chart skeleton (using Recharts or simple SVG path animation) showing a price starting high, dropping, and plateauing.
- **Copy:** "Historical Price Tracking. Never guess if you're getting a good deal. Once we collect 3+ months of data, you'll see exactly how component prices trend over time."
- **Tag:** `Q3 2026` or `Gathering Data...`

**2. Price Drop Alerts**
- **Copy:** "Set a target price for your saved build. We'll email/notify you the second a vendor drops the price to your budget."

**3. Direct Vendor Checkout**
- **Copy:** "One-click checkout. Send your entire cart directly to StarTech or Ryans without manually searching for each part again."

### Style Notes
- **Layout:** Bento-style asymmetrical grid. The Price Graph card should be wider (`col-span-2`) to show off the visual.
- **Visuals:** Heavy use of "wireframe/skeleton" aesthetics. E.g., the graph should look like an authentic UI mockup.
- **Badge:** Give the section a subtle "Roadmap" or "Beta" badge to set expectations.

---

## Section E: "Earn While You Share" — Referral Teaser

**Purpose:** Tease the gamification/referral system to convert visitors into registered users.

```
┌─ SECTION: Earn While You Share ───────────────────────────────────────────┐
│  bg-gradient-to-r from-[#4f9e97]/5 to-transparent                        │
│  border-t border-b border-[#4f9e97]/20                                    │
│                                                                           │
│  ┌─ glass-card (single wide card, centered max-w-4xl) ───────────────┐   │
│  │                                                                    │   │
│  │  🎁   Earn Free AI Builds                                         │   │
│  │                                                                    │   │
│  │  Share PC Lagbe? with your friends. When they sign up and          │   │
│  │  build their first PC, you both earn 10 free tokens                │   │
│  │  — enough for a full AI build!                                     │   │
│  │                                                                    │   │
│  │  Top referrers are featured on our Leaderboard. 🏆                │   │
│  │                                                                    │   │
│  │  [ Sign Up & Get Your Referral Link ]   (btn-primary)             │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Style Notes
- Single centered `glass-card-glow` with teal border accent
- `🎁` icon in a `bg-[#4f9e97]/20 rounded-xl p-3` container
- CTA: `btn-primary` linking to `/register`
- Entire section has a subtle teal gradient background

---

## Section G: "Top Builds" — Community Showcase

**Purpose:** Show real (or curated) AI-generated builds to inspire visitors. Acts as social proof + demonstrates the product output.

```
┌─ SECTION: Top Builds This Week ───────────────────────────────────────────┐
│  bg-black, subtle teal glow off-left                                      │
│                                                                           │
│              🔥 Top Builds This Week                                     │
│              See what the community is building.                         │
│                                                                           │
│  ┌─ HORIZONTAL SCROLL (snap, gap-6) ─────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ BUILD CARD ─────────┐  ┌─ BUILD CARD ─────────┐  ┌─ BUILD ┐  │   │
│  │  │  glass-card-glow      │  │  glass-card           │  │ CARD   │  │   │
│  │  │                       │  │                       │  │        │  │   │
│  │  │  🎮 Gaming Beast      │  │  🎬 Editing Station   │  │  ☁️    │  │   │
│  │  │  Score: 9.4/10        │  │  Score: 8.9/10        │  │  9.1   │  │   │
│  │  │                       │  │                       │  │        │  │   │
│  │  │  ── COMPONENTS ────── │  │  ── COMPONENTS ────── │  │  ...   │  │   │
│  │  │  CPU: Ryzen 7 7700X   │  │  CPU: i7-13700K       │  │        │  │   │
│  │  │  GPU: RTX 4070        │  │  GPU: RTX 4060 Ti     │  │        │  │   │
│  │  │  RAM: 32GB DDR5       │  │  RAM: 32GB DDR5       │  │        │  │   │
│  │  │                       │  │                       │  │        │  │   │
│  │  │  Total: ৳105,000      │  │  Total: ৳92,000       │  │        │  │   │
│  │  │                       │  │                       │  │        │  │   │
│  │  │  by Sultan R. · 2d    │  │  by Tanha S. · 5d     │  │        │  │   │
│  │  │  [View Build →]       │  │  [View Build →]       │  │        │  │   │
│  │  └───────────────────────┘  └───────────────────────┘  └────────┘  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│                    [  See All Builds →  ]  (text link, teal)             │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content

Each build card shows:

| Field | Source | Style |
|---|---|---|
| Purpose icon + label | `build.purpose` → emoji + name | `text-lg font-bold text-white` |
| AI Score | `quality.score` | Teal badge pill `bg-[#4f9e97]/20 text-[#4f9e97]` |
| Top 3 components | CPU, GPU, RAM from `build.components[]` | `text-sm text-neutral-400` with component type as prefix |
| Total price | `build.total_price` | `text-xl font-bold text-white` |
| Builder name + age | `user.display_name` + relative time | `text-xs text-neutral-500` |
| [View Build →] | Links to `/build/{share_slug}` | Teal text link |

### Style Notes
- Cards: `glass-card p-6 w-[320px] flex-shrink-0` — fixed width for horizontal scroll
- First card gets `glass-card-glow` to stand out
- Horizontal scroll: `overflow-x-auto scroll-snap-x snap-mandatory` with `snap-start` on each card
- Hide scrollbar: `scrollbar-hide` utility
- "See All Builds" link at bottom center
- Data source: `/api/builds/top?limit=6` (future endpoint, use mock data for now)

---

## Section H: "Featured Offers" — Vendor Deals

**Purpose:** Showcase hot deals from vendors. Drives affiliate traffic and gives vendors a reason to partner with PC Lagbe.

```
┌─ SECTION: Featured Offers ────────────────────────────────────────────────┐
│  bg-black                                                                 │
│                                                                           │
│              🏷️ Featured Offers                                          │
│              Hand-picked deals from top retailers.                       │
│                                                                           │
│  ┌─ 3-COLUMN GRID ───────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ DEAL CARD ────────────┐  ┌─ DEAL CARD ────────────┐  ┌─────┐ │   │
│  │  │  glass-card              │  │  glass-card              │  │     │ │   │
│  │  │                          │  │                          │  │     │ │   │
│  │  │  ┌──────────────────┐    │  │  ┌──────────────────┐    │  │     │ │   │
│  │  │  │  StarTech logo   │    │  │  │  Ryans logo      │    │  │ ... │ │   │
│  │  │  │  (grayscale)     │    │  │  │  (grayscale)     │    │  │     │ │   │
│  │  │  └──────────────────┘    │  │  └──────────────────┘    │  │     │ │   │
│  │  │                          │  │                          │  │     │ │   │
│  │  │  RTX 4060 8GB            │  │  Ryzen 5 7600            │  │     │ │   │
│  │  │  MSI Ventus OC           │  │  Tray                    │  │     │ │   │
│  │  │                          │  │                          │  │     │ │   │
│  │  │  ̶৳̶4̶5̶,̶0̶0̶0̶  ৳38,500     │  │  ̶৳̶2̶5̶,̶0̶0̶0̶  ৳21,800     │  │     │ │   │
│  │  │  🔴 14% OFF              │  │  🔴 13% OFF              │  │     │ │   │
│  │  │                          │  │                          │  │     │ │   │
│  │  │  [ View on StarTech → ]  │  │  [ View on Ryans → ]    │  │     │ │   │
│  │  └──────────────────────────┘  └──────────────────────────┘  └─────┘ │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│                Prices auto-updated · Not sponsored                       │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Content

Each deal card shows:

| Field | Style |
|---|---|
| Vendor logo | Small grayscale logo, `h-6 opacity-50` |
| Product name | `text-lg font-semibold text-white` |
| Product variant | `text-sm text-neutral-500` |
| Original price | `line-through text-neutral-600 text-sm` |
| Sale price | `text-2xl font-bold text-white` |
| Discount badge | `bg-red-500/20 text-red-400 text-xs font-bold rounded-full px-2 py-0.5` |
| [View on Vendor →] | `text-[#4f9e97] hover:underline text-sm` (external link) |

### Data Source
- From the scraper: components with `previous_price > current_price` (price drops)
- Future endpoint: `/api/deals/featured?limit=6`
- For now: hardcoded mock data from recent StarTech/Ryans price changes

### Style Notes
- Cards: `glass-card p-6 hover:border-[#4f9e97]/20 transition-colors`
- 3 columns on desktop, 1 on mobile (stacked)
- Disclaimer at bottom: "Prices auto-updated · Not sponsored" in `text-neutral-600 text-xs`

---

## Section I: "Live Activity Feed" — Social Proof Ticker ⚡ SKELETON EXPERIMENT

> **This is a skeleton/experiment.** Build it first, see how it looks, then decide whether to keep.

**Purpose:** Create a sense of "this platform is alive" — show real-time-ish activity like recent builds, signups, and shares. Similar to how SaaS sites show "X just signed up" popups, but as an inline feed.

```
┌─ SECTION: Live Activity ──────────────────────────────────────────────────┐
│  bg-black, very subtle — sits between Testimonials and Referral Teaser    │
│                                                                           │
│  ┌─ glass-card (max-w-md, centered, compact, auto-scrolling) ────────┐   │
│  │                                                                    │   │
│  │  ⚡ Live on PC Lagbe       (header, text-sm, teal dot blink)      │   │
│  │  ─────────────────────────────────                                 │   │
│  │                                                                    │   │
│  │  🟢 Sultan R. just built a ৳85k Gaming PC           · 2m ago      │   │
│  │  🟢 Anonymous Builder shared a build                · 5m ago      │   │
│  │  🟢 Tanha S. earned 10 tokens from a referral       · 12m ago     │   │
│  │  🟢 Mahir K. downloaded a build PDF                 · 18m ago     │   │
│  │  🟢 New user joined from Chittagong                 · 25m ago     │   │
│  │  🟢 Nusrat J. swapped GPU in her editing build      · 31m ago     │   │
│  │  🟢 Ahmed K. just built a ৳65k Office PC            · 1h ago      │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Feed Entries (Mock Data)

| # | Icon | Text | Time |
|---|---|---|---|
| 1 | 🟢 | Sultan R. just built a ৳85k **Gaming** PC | 2m ago |
| 2 | 🟢 | Anonymous Builder shared a build | 5m ago |
| 3 | 🟢 | Tanha S. earned 10 tokens from a referral | 12m ago |
| 4 | 🟢 | Mahir K. downloaded a build PDF | 18m ago |
| 5 | 🟢 | New user joined from Chittagong | 25m ago |
| 6 | 🟢 | Nusrat J. swapped GPU in her editing build | 31m ago |
| 7 | 🟢 | Ahmed K. just built a ৳65k **Office** PC | 1h ago |

### Behavior
- Shows 6–7 most recent activities in a compact vertical list
- Each row is `text-sm text-neutral-400`, with the name in `text-white font-medium`
- Header has a **blinking green dot** (CSS `animation: pulse 2s infinite`) next to "Live on PC Lagbe"
- Auto-scrolls: every 4 seconds, the top item fades out and a new one slides in from bottom (`AnimatePresence`)
- On hover: pause auto-scroll
- Future: wire to a real WebSocket or polling endpoint (`/api/activity/recent`)
- MVP: completely static mock data, but with the auto-scroll animation to look alive

### Style Notes
- Card: `glass-card max-w-md mx-auto p-6`, very compact
- Each row: `py-2 border-b border-white/5 last:border-0`
- Timestamp: `text-xs text-neutral-600 float-right`
- Green dot: `w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block mr-2`
- Entire section is minimal — intentionally understated, not a hero section

---

## Section J: Community Vision 🌐 (Future Roadmap Suggestion)

> **This section is NOT for the landing page — it's a feature proposal for the user to consider.**

### The Idea: Turn PC Lagbe? into Bangladesh's PC Building Community

Right now PC Lagbe is a **tool** (build → buy). Adding community features turns it into a **platform** where users come back, engage, and bring friends. Here are concrete ideas:

### Tier 1 — Quick Wins (add to existing system)

| Feature | Description | Effort |
|---|---|---|
| **Public Build Gallery** | Users can publish their builds. Other visitors browse by purpose, budget, score. Each build page already has share/OG-image. Add a `/builds` index page. | Low |
| **Build Comments** | Let visitors comment on shared builds: "Did this GPU bottleneck in Cyberpunk?" Requires a `comments` table + simple UI. | Medium |
| **Builder Profiles** | Public `/u/{username}` page showing a user's published builds, referral rank, and join date. Gamification hook. | Medium |
| **Upvotes / "Used This Build"** | Let visitors upvote builds or mark "I bought this exact config." Adds real social proof. | Low |

### Tier 2 — Community Engagement

| Feature | Description | Effort |
|---|---|---|
| **Discussion Forum / Q&A** | "Should I go RTX 4060 or RX 7600 for 1080p?" — threaded discussions. Could use a lightweight solution like embedded Disqus or build a simple forum. | High |
| **Weekly Build Challenge** | "Best build under ৳50k" — community votes, winner gets bonus tokens. Creates recurring content + engagement. | Medium |
| **Build Comparison Tool** | Side-by-side compare two builds. Users share comparison links in Facebook groups. | Medium |
| **"Ask the AI" Chat** | A chatbot on the landing page where visitors can ask PC questions: "Is 16GB RAM enough for video editing?" Low-effort since you already have the Gemini integration. | Medium |

### Tier 3 — Platform Play

| Feature | Description | Effort |
|---|---|---|
| **Vendor Partnership Dashboard** | Let vendors (StarTech, Ryans) submit featured deals. Revenue stream for PC Lagbe. | High |
| **Build-for-Others Service** | Experienced builders offer to help newbies configure PCs. Paid in tokens. | High |
| **YouTube/Content Creator Builds** | Partner with BD tech YouTubers. They submit builds, get a branded `/u/youtuber` page. Drives traffic. | Medium |
| **PC Build Request Board** | "I need a ৳40k build for Valorant" — the community (or AI) responds. Like a classifieds board for builds. | High |

### Suggested Community Landing Page Section (if you decide to go this route)

```
┌─ SECTION: Join the Community ─────────────────────────────────────────────┐
│                                                                           │
│           🌐 Bangladesh's Growing PC Community                           │
│                                                                           │
│  ┌─ 3-COLUMN STATS (glass-card, centered) ───────────────────────────┐   │
│  │                                                                    │   │
│  │     247+              85+               12k+                      │   │
│  │   Builders         Shared Builds      Components                  │   │
│  │   Registered       This Month         Tracked                     │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ glass-card-glow (centered, max-w-xl) ────────────────────────────┐   │
│  │                                                                    │   │
│  │  Share builds, earn tokens, climb the leaderboard.                │   │
│  │  Join the community building PCs the smart way.                   │   │
│  │                                                                    │   │
│  │  [ Join Now — It's Free ]   (btn-primary)                         │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Section F: Full Footer

**Purpose:** Replace the current one-line footer with a proper multi-column layout.

```
┌─ FOOTER ──────────────────────────────────────────────────────────────────┐
│  bg-black, border-t border-neutral-800                                    │
│                                                                           │
│  ┌─ 4-COLUMN GRID (max-w-6xl, centered) ─────────────────────────────┐   │
│  │                                                                    │   │
│  │  COLUMN 1            COLUMN 2         COLUMN 3       COLUMN 4    │   │
│  │                                                                    │   │
│  │  🔲 PC Lagbe?       Product           Company        Connect     │   │
│  │                                                                    │   │
│  │  Bangladesh's        PC Builder       About Us       Facebook    │   │
│  │  smartest PC         Components       Blog           Discord     │   │
│  │  building            Pricing          Contact        GitHub      │   │
│  │  assistant.          Leaderboard      Privacy        WhatsApp    │   │
│  │                      API (B2B)        Terms                      │   │
│  │  Powered by                                                       │   │
│  │  Zenfa AI                                                         │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ BOTTOM BAR (border-t border-neutral-800/50, py-6) ───────────────┐   │
│  │                                                                    │   │
│  │  © 2026 PC Lagbe? — Built with ♡ for BD PC enthusiasts.          │   │
│  │                                               Made by Zenfa AI   │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Footer Links

| Column | Label | Links |
|---|---|---|
| **Brand** | PC Lagbe? | Logo + tagline: "Bangladesh's smartest PC building assistant." + "Powered by Zenfa AI" |
| **Product** | Product | PC Builder → `/build`, Components → `/components`, Pricing → `/pricing`, Leaderboard → `/dashboard/leaderboard`, API (B2B) → external link |
| **Company** | Company | About Us → `/about` (future), Blog → `/blog` (future), Contact → mailto or `/support`, Privacy → `/privacy`, Terms → `/terms` |
| **Connect** | Connect | Facebook → external, Discord → external, GitHub → repo link, WhatsApp → `wa.me/...` |

### Style Notes
- Column headers: `text-sm font-bold text-white uppercase tracking-wider mb-4`
- Links: `text-neutral-500 text-sm hover:text-[#4f9e97] transition-colors` with `leading-loose` (generous spacing)
- Logo column: slightly larger, includes Zenfa AI credit
- Bottom bar: `text-neutral-600 text-xs`, split left/right with flexbox
- On mobile: 2-column grid (Brand spans full width on top, then 2×2 for links)

---

## Implementation Notes

### Scroll Order Summary

```
<TakaHero />                    ← existing, DO NOT TOUCH

<FeaturesSection />              ← existing bento grid

<HowItWorks />                   ← NEW (Section A)
<TrustedVendors />               ← NEW (Section B)
<TopBuilds />                    ← NEW (Section G)
<FeaturedOffers />               ← NEW (Section H)
<WhyPCLagbe />                   ← NEW (Section C)
<Testimonials />                 ← NEW (Section D)
<LiveActivityFeed />             ← NEW (Section I) — skeleton experiment
<UpcomingFeatures />             ← NEW (Section K) — roadmap teaser
<ReferralTeaser />               ← NEW (Section E)

<CTASection />                   ← existing "Ready to Build?"

<Footer />                       ← NEW (Section F, replaces old footer)
```

### Component Strategy

Each new section should be its own component file for maintainability:

| Component | File |
|---|---|
| `HowItWorks` | `components/landing/HowItWorks.tsx` |
| `TrustedVendors` | `components/landing/TrustedVendors.tsx` |
| `TopBuilds` | `components/landing/TopBuilds.tsx` |
| `FeaturedOffers` | `components/landing/FeaturedOffers.tsx` |
| `WhyPCLagbe` | `components/landing/WhyPCLagbe.tsx` |
| `Testimonials` | `components/landing/Testimonials.tsx` |
| `LiveActivityFeed` | `components/landing/LiveActivityFeed.tsx` |
| `UpcomingFeatures` | `components/landing/UpcomingFeatures.tsx` |
| `ReferralTeaser` | `components/landing/ReferralTeaser.tsx` |
| `Footer` | `components/landing/Footer.tsx` |

### Animation Guidelines
- All sections use `motion.div` with `whileInView` and `viewport={{ once: true }}`
- Stagger children by 0.1–0.15s
- Use `fadeInUp` variant (opacity 0→1, y 40→0) for consistency with existing sections
- No autoplay videos or heavy animations — keep it lightweight to not compete with the TakaHero
