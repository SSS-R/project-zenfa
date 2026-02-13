# 🚀 Promotional Website — Agent Brief

> **Goal:** Build a "coming soon" / hype landing website for two products under the same brand umbrella. This site should generate excitement, build a waitlist, and establish community presence BEFORE launch.

---

## 🎯 The Two Products

### Product 1: PC Lagbe? — The Consumer Platform
- **Tagline:** "Don't build a PC. Let the PC build itself."
- **Target:** Bangladeshi consumers who want to buy PC parts
- **Value:** AI-powered PC builder + price aggregator across all BD tech stores
- **ETA:** Coming Soon (2026)

### Product 2: Zenfa AI — The B2B Engine
- **Tagline:** "The intelligence behind the build."
- **Target:** Tech retailers, e-commerce vendors, system integrators
- **Value:** An API that any vendor can plug into their website to offer AI-powered PC build recommendations using their own inventory
- **ETA:** After PC Lagbe? launches

### The Relationship
PC Lagbe? is the **consumer-facing product** powered by Zenfa AI. Zenfa AI is the **B2B API product** built from the same technology. Think of it as:
- **PC Lagbe? = the restaurant** (where users eat)
- **Zenfa AI = the recipe/kitchen** (that other restaurants can license)

---

## 🎨 Design Direction

### Overall Vibe
- **Premium, modern, tech-forward** — NOT generic startup landing page
- Think: Linear.app, Vercel, Stripe — that level of polish
- Dark mode default (charcoal/slate, NOT pitch black)
- Subtle glassmorphism, smooth gradients
- Micro-animations on scroll (GSAP or Framer Motion)

### Color Palette
```
Primary:    #4f9e97 → #6ee1c9 (Teal gradient — established brand color)
Background: #0f1117 (deep charcoal)
Surface:    #1a1d27 (card backgrounds)
Text:       #e4e4e7 (primary) / #9ca3af (secondary)
Accent:     #4f9e97 (buttons, highlights, glow effects)
Warning/CTA: #f59e0b (amber for urgent CTAs like "Join Waitlist")
```

### Typography
- Headings: **Outfit** or **Space Grotesk** (modern, geometric)
- Body: **Inter** (clean, readable)
- Code/Tech: **JetBrains Mono** (for any code/API snippets)

### Must-Have Visual Elements
1. **Hero animation** — Something captivating. Ideas:
   - Animated particles forming a PC/circuit board shape
   - A 3D GPU slowly rotating with a glowing teal aura
   - Floating component cards assembling into a build
2. **Scroll-triggered reveals** — Sections fade/slide in as user scrolls
3. **Glowing borders** on cards (subtle teal glow on hover)
4. **Animated counters** — "X people on the waitlist" (start at a seed number)
5. **Grid/mesh background** — Subtle animated dot grid or mesh gradient

---

## 📄 Page Structure

### Single Page, Multiple Sections (Scroll-Based)

```
┌─────────────────────────────────────────┐
│            SECTION 1: HERO              │
│  "Don't build a PC. Let the PC build   │
│          itself."                        │
│  [Join the Waitlist] [Learn More ↓]     │
│  Animated hero visual                   │
│  "Launching 2026 in Bangladesh"         │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│        SECTION 2: THE PROBLEM           │
│  "Buying PC parts in BD is broken."     │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ 10+  │ │ No   │ │ Over-│           │
│  │ tabs │ │ comp-│ │ priced│           │
│  │ open │ │atibi-│ │ parts │           │
│  │      │ │ lity │ │      │           │
│  │      │ │ check│ │      │           │
│  └──────┘ └──────┘ └──────┘           │
│                                         │
│  Pain point cards with icons            │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│        SECTION 3: THE SOLUTION          │
│  Two product cards side by side         │
│                                         │
│  ┌─────────────────┐ ┌────────────────┐│
│  │  PC Lagbe?      │ │  Zenfa AI      ││
│  │  For You        │ │  For Business  ││
│  │                 │ │                ││
│  │  - AI Builder   │ │  - Build API   ││
│  │  - Price Compare│ │  - White-label ││
│  │  - Best Deals   │ │  - Analytics   ││
│  │                 │ │                ││
│  │  [Join Waitlist] │ │ [Get API Access]│
│  └─────────────────┘ └────────────────┘│
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│      SECTION 4: HOW IT WORKS            │
│  Animated step-by-step flow             │
│                                         │
│  Step 1: Tell us your budget & purpose  │
│       → Input mockup animation          │
│  Step 2: Our AI analyzes thousands of   │
│          parts across BD stores         │
│       → "Thinking" animation with loop  │
│  Step 3: Get the perfect build in       │
│          under 2 minutes                │
│       → Build result card animation     │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│    SECTION 5: LIVE DEMO / TEASER        │
│  Interactive mockup (NOT functional)    │
│                                         │
│  Budget slider: [||||||||----] 80,000৳  │
│  Purpose: [Gaming] [Editing] [Office]   │
│                                         │
│  "Sign up to be the first to try"       │
│  [Join Waitlist →]                      │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│     SECTION 6: FOR VENDORS / B2B        │
│  "Power your store with Zenfa AI"       │
│                                         │
│  API code snippet preview:              │
│  ┌─────────────────────────────────┐    │
│  │ POST /api/v1/build/generate     │    │
│  │ { "budget": 80000,              │    │
│  │   "purpose": "gaming" }         │    │
│  │                                 │    │
│  │ → Score: 9.1/10                 │    │
│  │ → RTX 7700 XT, Ryzen 5 7600... │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Pricing tiers:                         │
│  Free (100/mo) | Pro ($0.05) | Custom   │
│                                         │
│  [Request API Access →]                 │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│    SECTION 7: SOCIAL PROOF / TRUST      │
│  "Built by enthusiasts, for everyone"   │
│                                         │
│  - GitHub star count / contributor info  │
│  - Tech stack badges (FastAPI, Next.js)  │
│  - "Backed by real BD market data"      │
│  - Vendor logos (StarTech, Ryans, etc.) │
│    as "Aggregating prices from..."      │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│       SECTION 8: WAITLIST CTA           │
│  Big, final call to action              │
│                                         │
│  "Be the first to know."               │
│  [Email input] [Join →]                 │
│                                         │
│  Counter: "🔥 873 people already on     │
│            the waitlist"                │
│                                         │
│  Social links: Discord | Twitter/X |    │
│                 GitHub | Facebook       │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│          FOOTER                         │
│  © 2026 PC Lagbe? · Powered by Zenfa AI│
│  Made with ❤️ in Bangladesh             │
│  Privacy · Terms · Contact              │
└─────────────────────────────────────────┘
```

---

## ⚙️ Technical Requirements

### Stack
- **Framework:** Next.js (App Router) or plain Vite — keep it simple, it's a landing page
- **Styling:** Vanilla CSS (or Tailwind if the agent prefers — both fine for a landing page)
- **Animations:** GSAP or Framer Motion for scroll reveals and micro-interactions
- **Fonts:** Google Fonts (Outfit + Inter)
- **No backend needed** — static site with a fake waitlist counter (hardcoded seed + localStorage increment)

### Waitlist Signup
For now, the email waitlist can be:
- **Option A (Simple):** Google Forms embed or Tally.so form — no backend needed
- **Option B (Better):** Free tier of Formspree, Getform, or ConvertKit — collects emails
- **Option C (Best, future):** Own API endpoint in the main backend

> **For the initial build, use Option A or B. Do NOT build a backend for the waitlist.**

### Deployment
- **Vercel** (free tier, instant deploy, perfect for Next.js)
- Or **Netlify** / **GitHub Pages** if static

### SEO
- Title: "PC Lagbe? — AI-Powered PC Builder for Bangladesh"
- Description: "Stop comparing prices across 10 stores. Tell us your budget, get the perfect build in under 2 minutes. Powered by Zenfa AI."
- OpenGraph image: A branded card with the logo + tagline (generate this)
- Keywords: PC builder Bangladesh, PC price comparison BD, buy PC parts Bangladesh

---

## 📝 Copy / Content Guide

### Tone of Voice
- **Confident but not arrogant** — "We're building something great" not "We're the best"
- **Conversational Bengali-English mix is OK** — The audience is bilingual (e.g., "PC banano hobe? Amra kori.")
- **Tech-savvy but accessible** — Don't assume everyone knows what a knapsack algorithm is
- **Urgency without desperation** — "Join the waitlist" not "SIGN UP NOW!!!"

### Key Messages to Communicate

#### For Consumers (PC Lagbe?)
1. **No more 10-tab nightmare** — One search, all BD stores, best prices
2. **AI builds your PC** — Tell us your budget → get a perfect build
3. **100% compatible, guaranteed** — Our system checks every part fits before suggesting
4. **Best value, not most expensive** — We optimize for performance-per-taka
5. **Launching soon in Bangladesh** — Be the first to try

#### For Vendors (Zenfa AI)
1. **Add AI PC building to YOUR website** — Simple API integration
2. **Your inventory, our intelligence** — We use your stock and prices
3. **Increase conversions** — Users who get build suggestions buy more
4. **Usage-based pricing** — Pay only for what you use
5. **White-label ready** — Your brand, our engine

### Headlines (Pick/Adapt)
- "Don't build a PC. Let the PC build itself."
- "The smartest way to buy PC parts in Bangladesh."
- "Your budget. Your purpose. The perfect build. Under 2 minutes."
- "One search. Every store. Best price. Always."
- "Stop overpaying. Start building smarter."

---

## 🏗️ Build Order for the Agent

```
Step 1: Project scaffolding
        - Initialize Next.js or Vite project
        - Setup Google Fonts (Outfit + Inter)
        - Define CSS variables (colors, spacing, typography)
        - Create dark theme base

Step 2: Hero section
        - Headline + subheadline + CTA buttons
        - Hero animation (particles, floating components, or gradient mesh)
        - "Launching 2026" badge

Step 3: Problem section
        - 3 pain point cards with icons
        - Scroll-triggered fade-in animation

Step 4: Solution section
        - Two product cards (PC Lagbe? + Zenfa AI)
        - Glassmorphism card style with hover glow

Step 5: How It Works section
        - 3-step animated flow
        - Step indicators with connecting lines

Step 6: Interactive teaser
        - Budget slider (visual only, no real calculation)
        - Purpose toggle buttons
        - "Sign up to try" CTA

Step 7: Vendor/B2B section
        - API code snippet with syntax highlighting
        - Pricing tier cards
        - "Request Access" CTA

Step 8: Social proof section
        - Tech stack badges
        - Vendor logos ("Aggregating from...")
        - Trust indicators

Step 9: Waitlist CTA section
        - Email input + submit button
        - Animated counter
        - Social media links

Step 10: Footer
         - Copyright, links, "Made in Bangladesh" 

Step 11: Polish
         - Smooth scroll behavior
         - Mobile responsiveness (critical!)
         - Loading animations
         - Favicon + OG image
         - Performance optimization
```

---

## ❌ Anti-Patterns (DO NOT)

| Don't | Why |
|---|---|
| Use "gamer" aesthetics (neon RGB, aggressive fonts) | Brand is premium/FinTech, not gaming |
| Make it look like a generic Tailwind template | Must feel unique and custom |
| Use stock photos of people | Use abstract/tech illustrations or 3D renders |
| Show actual prices or real builds | Product isn't live yet, don't promise specifics |
| Build a backend for the waitlist | Use a form service (Formspree/Tally) |
| Make it text-heavy | Visual-first, copy-second — let animations tell the story |
| Ignore mobile | 60%+ of BD users browse on mobile |

---

## ✅ Success Criteria

The website is successful if:
1. A visitor understands what PC Lagbe? does within **5 seconds**
2. A visitor understands what Zenfa AI is within **30 seconds**
3. The design makes them think **"this looks legit and professional"**
4. They feel **FOMO** and want to join the waitlist
5. A vendor visiting the B2B section thinks **"I want this on my site"**
6. The site loads in **under 2 seconds** on mobile
7. It looks stunning on both desktop and mobile
