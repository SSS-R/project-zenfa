# PC Lagbe? — Feed Page Design (`/feed`)

> The **Feed** is the community hub. Think of it as a lightweight, focused social feed where builders share, discuss, and compare PC builds. It's not a forum — it's a curated activity stream built around **builds**.

---

## Page Purpose

Turn PC Lagbe from a **tool** (use once, leave) into a **platform** (come back daily). The Feed gives users reasons to return: see what others are building, join challenges, ask questions, flex their builds.

---

## Page Layout

```
┌─ /feed ───────────────────────────────────────────────────────────────────┐
│  bg-black, max-w-5xl centered                                             │
│                                                                           │
│  ┌─ STICKY HEADER ────────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  🌐 Community Feed                          [ Share a Build ] btn │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ TAB BAR ──────────────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │   🔥 Trending    🕓 Latest    🏆 Top Builds    💬 Discussions     │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─ 2-COLUMN LAYOUT ─────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─ MAIN FEED (left, wider) ────────────────────────────────┐     │   │
│  │  │                                                          │     │   │
│  │  │  ┌─ FEED CARD ────────────────────────────────────────┐  │     │   │
│  │  │  │  glass-card                                        │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  👤 Sultan R.  ·  2h ago  ·  🎮 Gaming           │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  "Just finished my dream gaming setup! RTX 4070    │  │     │   │
│  │  │  │   with Ryzen 7 7700X. Score: 9.4/10"              │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  ┌─ BUILD PREVIEW (collapsed) ──────────────────┐  │  │     │   │
│  │  │  │  │  CPU: Ryzen 7 7700X  ·  GPU: RTX 4070       │  │  │     │   │
│  │  │  │  │  RAM: 32GB DDR5  ·  Total: ৳105,000          │  │  │     │   │
│  │  │  │  │  [ View Full Build → ]                        │  │  │     │   │
│  │  │  │  └──────────────────────────────────────────────┘  │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  ▲ 24 upvotes  ·  💬 5 comments  ·  🔗 Share    │  │     │   │
│  │  │  └────────────────────────────────────────────────────┘  │     │   │
│  │  │                                                          │     │   │
│  │  │  ┌─ DISCUSSION CARD ──────────────────────────────────┐  │     │   │
│  │  │  │  glass-card                                        │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  💬 Mahir K.  ·  4h ago                           │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  "RTX 4060 vs RX 7600 for 1080p gaming — which    │  │     │   │
│  │  │  │   has better value in BD right now?"               │  │     │   │
│  │  │  │                                                    │  │     │   │
│  │  │  │  ▲ 12 upvotes  ·  💬 18 comments  ·  🔗 Share   │  │     │   │
│  │  │  └────────────────────────────────────────────────────┘  │     │   │
│  │  │                                                          │     │   │
│  │  │  ... (infinite scroll)                                   │     │   │
│  │  │                                                          │     │   │
│  │  └──────────────────────────────────────────────────────────┘     │   │
│  │                                                                    │   │
│  │  ┌─ SIDEBAR (right, narrower) ──────────────────────────────┐     │   │
│  │  │                                                          │     │   │
│  │  │  ┌─ WEEKLY CHALLENGE ──────────────────────────────┐     │     │   │
│  │  │  │  glass-card-glow                                │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  🏆 This Week's Challenge                       │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  "Best Gaming Build Under ৳60,000"              │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  23 submissions  ·  3 days left                 │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  [ Submit Your Build ]                          │     │     │   │
│  │  │  └──────────────────────────────────────────────────┘     │     │   │
│  │  │                                                          │     │   │
│  │  │  ┌─ LEADERBOARD MINI ──────────────────────────────┐     │     │   │
│  │  │  │  glass-card                                     │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  🥇 Top Builders This Week                      │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  1. Sultan R.    — 12 builds                    │     │     │   │
│  │  │  │  2. Tanha S.     — 9 builds                     │     │     │   │
│  │  │  │  3. Mahir K.     — 7 builds                     │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  [ Full Leaderboard → ]                         │     │     │   │
│  │  │  └──────────────────────────────────────────────────┘     │     │   │
│  │  │                                                          │     │   │
│  │  │  ┌─ TRENDING TAGS ─────────────────────────────────┐     │     │   │
│  │  │  │  glass-card                                     │     │     │   │
│  │  │  │                                                  │     │     │   │
│  │  │  │  #gaming  #under50k  #rtx4060  #editing         │     │     │   │
│  │  │  │  #ryzen7  #budget  #ddr5  #first-build          │     │     │   │
│  │  │  └──────────────────────────────────────────────────┘     │     │   │
│  │  │                                                          │     │   │
│  │  └──────────────────────────────────────────────────────────┘     │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Feed Card Types

### 1. Build Share Card
When a user publishes their AI-generated build to the feed.

| Element | Style |
|---|---|
| Avatar + Name | `text-white font-medium` · relative time in `text-neutral-500 text-xs` |
| Purpose badge | `bg-[#4f9e97]/10 text-[#4f9e97] text-xs rounded-full px-2 py-0.5` |
| Caption | `text-neutral-300 text-sm`, user's optional note about the build |
| Build preview | Compact `glass-card` sub-card showing CPU, GPU, RAM, Total price |
| "View Full Build" | Teal text link → opens `/build/{slug}` |
| Actions | `▲ Upvote` · `💬 Comments` · `🔗 Share` — `text-xs text-neutral-500 hover:text-white` |

### 2. Discussion Card
When a user posts a question or discussion topic.

| Element | Style |
|---|---|
| Avatar + Name | Same as above |
| Question/Topic | `text-neutral-200 text-sm font-medium` — the main text |
| Tags | `#tag` pills in `text-xs text-[#4f9e97] bg-[#4f9e97]/10 rounded-full px-2` |
| Actions | Same upvote/comments/share bar |

### 3. Challenge Submission Card
Build shared as part of a weekly challenge.

| Element | Style |
|---|---|
| Challenge badge | `bg-yellow-500/10 text-yellow-400 text-xs` with 🏆 icon |
| Rest | Same as Build Share Card |

---

## Sidebar Widgets

### Weekly Challenge
- `glass-card-glow` with yellow accent
- Shows current challenge title, submission count, days remaining
- "Submit Your Build" CTA button

### Mini Leaderboard
- Top 3 builders by builds published this week
- Links to full `/dashboard/leaderboard`

### Trending Tags
- Clickable tag pills that filter the main feed
- Auto-generated from recent feed activity

---

## Tab Bar Behavior

| Tab | Feed Content |
|---|---|
| 🔥 Trending | Sorted by upvotes × recency (hot algorithm) |
| 🕓 Latest | Chronological, newest first |
| 🏆 Top Builds | Only Build Share cards, sorted by AI score |
| 💬 Discussions | Only Discussion cards |

---

## Interactions

- **Upvoting:** Toggle, shows count. Requires login.
- **Commenting:** Expandable thread below each card. Simple, no nesting (v1).
- **Sharing:** Copy link to clipboard, generates OG image.
- **"Used This Build":** Special reaction — "I bought this exact config" — badge + count shown on the build.

---

## Responsive
- On mobile: sidebar collapses below the feed, Weekly Challenge becomes a dismissible banner at top.
- Tab bar becomes horizontally scrollable.

---

## Data Requirements

| Endpoint | Description |
|---|---|
| `GET /api/feed?tab=trending&page=1` | Paginated feed items |
| `POST /api/feed` | Create new post (build share or discussion) |
| `POST /api/feed/{id}/upvote` | Toggle upvote |
| `GET /api/feed/{id}/comments` | Fetch comments for a post |
| `POST /api/feed/{id}/comments` | Add comment |
| `GET /api/challenges/current` | Current weekly challenge |
| `GET /api/feed/tags/trending` | Top tags |

---

## Style Notes
- Overall: Same dark glassmorphic system as rest of site.
- Feed cards: `glass-card p-6 space-y-4 hover:border-neutral-700/50 transition-colors`
- Infinite scroll: Load 10 items per page, skeleton loaders while fetching next batch.
- No page reload on tab switch — client-side filtering.
