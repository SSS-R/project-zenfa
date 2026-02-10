# Agent Suggestions for Future Enhancements

These suggestions are captured for future reference to improve the backend architecture, data quality, and scraping efficiency.

## 1. Code Quality Enforcement (Phase 1.1+)
**Suggestion:** Add **Ruff** or **Black** + **Isort** to `requirements.txt`.
**Why:** The project vision demands "Strictly follow PEP 8". Setting up a linter/formatter from the start ensures the codebase stays clean automatically.
**Action:** Add `ruff` to the development dependencies in `requirements.txt`.

## 2. Data Normalization Strategy (Phase 2 - Strategic)
**Suggestion:** Store **Raw HTML/JSON** alongside parsed data.
**Why:** The "Normalization Problem" (linking "Ryzen 5" from Shop A to Shop B) is complex. If normalization logic needs adjustment, having the raw data allows re-processing without re-scraping websites, preventing data loss and reducing risk of bans.

## 3. Hybrid Scraping Schedule (Phase 2 - Performance)
**Suggestion:** Implement a tiered scraping schedule instead of a flat 30-hour rotation.
**Why:** A flat schedule might miss flash sales or stock drops for high-demand items.
**Proposed Tiering:**
*   **Tier A (Hot items):** Scrape every 4-6 hours (e.g., latest GPUs, specialized CPUs).
*   **Tier B (Legacy/Stable):** Scrape every 30 hours (standard components).

## 4. Models and Scrapers Extension
**Suggestion:** When adding new components (like Case, Cooler), remember to update `ComponentType` enum and create corresponding models in `component.py` or new files.
**Why:** Keeping all models in `component.py` might make it large. Consider splitting models into separate files if the file grows beyond 500 lines.
