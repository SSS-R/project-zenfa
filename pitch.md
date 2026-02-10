# 🚀 Project Vision: "PC Lagbe?"
**Tagline:** "Don't build a PC. Let the PC build itself."
**Type:** AI-Driven Product Aggregator & Automated PC Builder
**Target Market:** Bangladesh (BD)

---

## 🎯 The Core Mission
To democratize PC building in Bangladesh by removing the complexity of compatibility, pricing, and availability. We are building the "Skyscanner" or "Expedia" for PC hardware—a tool that empowers non-tech users to get the best machine for their money without needing a degree in computer hardware.

---

## 🛑 The Problem Space
1.  **The Tab Nightmare:** Users currently have to open 10+ tabs (Star Tech, Ryans, Tech Land, etc.) to compare prices manually.
2.  **The Compatibility Trap:** Non-tech users do not know if a specific CPU fits a specific Motherboard. They rely on shopkeepers who may upsell them incompatible or overpriced stock.
3.  **The Budget Struggle:** Optimizing performance for a fixed budget (e.g., "Best Gaming PC for 80k BDT") is a complex math problem that most users cannot solve efficiently.

---

## 💡 The Solution Architecture
We are building a **Smart Aggregator & AI Builder**.

### 1. The "AI" Builder (For the Non-Techie)
* **Input:** Budget (e.g., 1 Lakh BDT) + Purpose (Gaming/Editing/Office).
* **Logic:** A custom "Knapsack Algorithm" running on the backend selects the *mathematically optimal* combination of parts (CPU, GPU, RAM, SSD) that fits the budget and is 100% compatible.
* **Outcome:** A complete build list generated in < 2 seconds.

### 2. The Aggregator (For the Enthusiast)
* **Function:** A search engine that scrapes prices from the top 5-7 BD tech stores every 30 hours.
* **Display:** Users search for a part (e.g., "RTX 4060") and see a sorted list of prices from all major vendors, ensuring they get the best deal.

---

## 🎨 Aesthetic & Design Philosophy
* **Vibe:** Premium, Scientific, Precision, "FinTech for Hardware."
* **Anti-Patterns:** NO "Gamer" aesthetics. NO excessive neon RGB. NO clutter.
* **Visual Identity:**
    * **Hero Animation:** A high-fidelity 3D transformation where **Bangladeshi Taka (৳)** coins dissolve and re-materialize into **PC Components** (GPU, RAM), symbolizing the conversion of wealth into performance.
    * **UI Style:** Clean lines, glassmorphism, dark mode default (charcoal/slate, not pitch black), and smooth micro-interactions (GSAP/Framer Motion).
# At present no need to see the "Aesthetic & Design Philosophy", it has already been changed and will be updated as we are going on so no need to worry about it. ignore it for now
---

## 🛠️ Technical Constraints & Stack
* **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS.
* **3D/Animation:** React Three Fiber (R3F) + GSAP.
* **Backend:** Python (FastAPI) for heavy math and scraping.
* **Database:** PostgreSQL (Relational data for compatibility rules).
* **Infrastructure:** Dockerized, with Redis for caching build results.

---

## 🤖 Directives for the AI Agent
*If you (the Agent) encounter an error or see an optimization opportunity, guide your suggestions by these rules:*

1.  **Speed is King:** If a database query or scraper logic is slow, suggest a caching strategy (Redis) immediately. The user must never wait more than 3 seconds for a build.
2.  **Accuracy Over Revenue:** The "Compatibility Check" must be 100% accurate. Never suggest a part if there is even a 1% chance it won't fit. Trust is our currency.
3.  **Scalability:** Write code that assumes 1,000+ concurrent users. Avoid synchronous blocking operations in the backend.
4.  **Code Quality:** Strictly follow **PEP 8** for Python and **ESLint/Prettier** standards for JavaScript. Use Type Hints everywhere.
5.  **The "Wow" Factor:** When coding frontend interactions, always ask: *"Does this feel premium? Does it feel like a modern app?"* If not, suggest a better animation or transition.