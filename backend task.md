# Backend Engineering Roadmap: PC Builder BD
# this is a drafted roadmap for the backend of the pc builder bd project, if the user wants to change anything, he can.
 
**Version:** 1.0
**Role:** Backend Architect Guide
**Objective:** Build a high-performance Python backend for an AI-driven PC Builder & Price Aggregator.

## 🛠️ Tech Stack Definition
* **Framework:** FastAPI (Python 3.11+)
* **Database:** PostgreSQL 16 (Relational Data)
* **ORM:** SQLModel (Pydantic + SQLAlchemy)
* **Async Task Queue:** Celery + Redis (for Scraping & Heavy Math)
* **Scraping:** Playwright (Python) + Beautiful Soup 4
* **Containerization:** Docker & Docker Compose

---

## 📅 Phase 1: Foundation & Database Architecture
*Goal: Establish the "Truth" for hardware compatibility.*

### 1.1 Project Initialization
- [ ] **Repo Setup:** Initialize `backend/` directory with `poetry` or `venv`.
- [ ] **Docker Setup:** Create `docker-compose.yml` spinning up:
    -   `db` (PostgreSQL)
    -   `redis` (Cache/Queue)
    -   `web` (FastAPI)
- [ ] **Environment Variables:** Create `.env` for `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`.

### 1.2 Database Schema (SQLModel)
*Define these tables in `models.py`.*

#### Base Hardware Tables
* **`Component` (Abstract/Base):** `id`, `name`, `slug`, `image_url`, `brand`, `model`
* **`CPU`:** Inherits Component + `socket` (e.g., AM5), `core_count`, `tdp`, `integrated_graphics` (bool), `boost_clock`
* **`Motherboard`:** Inherits Component + `socket`, `form_factor` (ATX/mATX), `ram_slot_type` (DDR4/DDR5), `max_ram`
* **`RAM`:** Inherits Component + `type` (DDR4/DDR5), `capacity_gb`, `speed_mhz`, `latency_cl`
* **`GPU`:** Inherits Component + `vram_gb`, `length_mm` (for case fit), `recommended_psu_wattage`
* **`Storage`:** Inherits Component + `type` (NVMe/SATA), `capacity_gb`
* **`PSU`:** Inherits Component + `wattage`, `efficiency_rating` (80+ Gold, etc.)

#### Market Data Tables
* **`Vendor`:** `id`, `name` (e.g., StarTech, Ryans), `base_url`, `logo_url`
* **`PriceListing`:**
    -   `id`
    -   `component_id` (FK)
    -   `vendor_id` (FK)
    -   `price` (Integer)
    -   `url` (Direct link to shop)
    -   `in_stock` (Boolean)
    -   `last_scraped_at` (DateTime)

---

## 🕷️ Phase 2: The Scraper Engine (Data Acquisition)
- [x] **Base Scraper Architecture:** Create `BaseScraper` and `ScraperConfig` <!-- id: 24 -->
- [x] **StarTech Spider:** Implement `StarTechScraper` with identified selectors <!-- id: 25 -->
- [x] **Skyland Spider:** Implement `SkylandScraper` <!-- id: 26 -->
- [ ] **Ryans Spider:** Implement `RyansScraper` (blocked by Cloudflare, future work) <!-- id: 27 -->
- [x] **Normalization Service:** Map raw specs to database models <!-- id: 28 -->
- [ ] **Scheduling:** Setup Celery/Redis for periodic scraping <!-- id: 29 -->

---

## 🧠 Phase 3: The "AI" Builder Logic
*Goal: The mathematical engine that solves the budget problem.*

### 3.1 Compatibility Service (`compatibility.py`)
- [ ] **Rules Engine:**
    -   `check_cpu_mobo(cpu, mobo)`: Return True if `cpu.socket == mobo.socket`.
    -   `check_ram_mobo(ram, mobo)`: Return True if `ram.type == mobo.ram_slot_type`.
    -   `check_psu_gpu(psu, gpu)`: Return True if `psu.wattage >= gpu.recommended_wattage`.

### 3.2 The Knapsack Algorithm (The "AI")
- [ ] **Input:** `budget` (int), `purpose` (Enum: Gaming, Editing, Office).
- [ ] **Weighting Logic:**
    -   *Gaming:* Prioritize GPU (Allocating ~40% of budget score).
    -   *Editing:* Prioritize CPU Core Count + RAM Capacity.
- [ ] **Implementation:**
    -   Fetch all compatible parts within budget range.
    -   Iterate through combinations (Greedy approach optimized for speed, or full Knapsack if dataset is small < 10k items).
    -   **Constraint:** `Sum(Prices) <= UserBudget` AND `Compatibility == True`.

---

## 🔌 Phase 4: API Layer (FastAPI)
*Goal: Serve data to the Next.js Frontend.*

### 4.1 Endpoints
* **Search:** `GET /api/v1/components/search?q=rtx+4060`
    -   Returns list of components with the *lowest* available price attached.
* **Builder:** `POST /api/v1/build/generate`
    -   Body: `{ "budget": 80000, "purpose": "gaming" }`
    -   Returns: `{ "cpu": {...}, "gpu": {...}, "total_price": 78500, "score": 95 }`
* **Product Detail:** `GET /api/v1/components/{slug}`
    -   Returns specs + list of prices from all vendors (sorted Low -> High).

### 4.2 Caching (Redis)
- [ ] **Cache Builds:** If User A requests "80k Gaming Build", cache the result key `build:80k:gaming` for 1 hour.
- [ ] **Cache Search:** Cache common queries like "Ryzen 5" for 10 minutes.

---

## 🚀 Phase 5: Deployment & Security
- [ ] **Rate Limiting:** Use `fastapi-limiter` to prevent API abuse (e.g., max 20 build requests/min per IP).
- [ ] **CORS:** Allow requests only from your Frontend domain.
- [ ] **Error Monitoring:** Integrate `Sentry` to catch scraper failures immediately.