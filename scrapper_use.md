# Scraper Usage Guide

## How to Run

1. Make sure backend is running: `uvicorn app.main:app --reload`
2. Make sure frontend is running: `npm run dev`

### Run the Scraper

```bash
cd backend
source .venv/bin/activate
python run_full_scrape.py
```

## What It Does

- Scrapes **8 component types** from StarTech & Skyland websites
- Gets **first 7 pages** from each category
- Processes **5 products at once** (much faster)
- Only saves **in-stock items** to your database
- Takes **15-25 minutes** to complete (was 80+ minutes)

### Component Types:

✅ CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooler

### Results:

- In-stock components appear on your website
- Prices in Bangladeshi Taka (৳)
- Automatic price updates
- Real-time inventory status
