# PC Lagbe?

**"Don't build a PC. Let the PC build itself."**

An AI-Driven Product Aggregator & Automated PC Builder designed for the Bangladeshi market. We are building the "Skyscanner" or "Expedia" for PC hardware—empowering non-tech users to get the best machine for their money without needing deep hardware knowledge.

## 🎯 The Mission
To democratize PC building in Bangladesh by removing the complexity of compatibility, pricing, and availability.

## 💡 Key Features

### 1. AI Builder (For the Non-Techie)
- **Input:** Budget + Purpose (Gaming/Editing/Office).
- **Core:** A custom "Knapsack Algorithm" selects the mathematically optimal combination of compatible parts.
- **Outcome:** A complete build list generated in < 2 seconds.

### 2. Smart Aggregator (For the Enthusiast)
- **Engine:** Scrapes prices from top BD tech stores every 30 hours.
- **Utility:** Compare prices across all major vendors for specific parts (e.g., "RTX 4060") in one place.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **3D/Animation:** React Three Fiber (R3F), GSAP
- **Backend:** Python (FastAPI) for logic and scraping
- **Database:** PostgreSQL
- **Infrastructure:** Docker, Redis

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Python (v3.10+)
- Docker (optional, for containerized run)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/project-zenfa.git
    cd project-zenfa
    ```

2.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Setup Backend:**
    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```

## 📄 License
[MIT](LICENSE)
