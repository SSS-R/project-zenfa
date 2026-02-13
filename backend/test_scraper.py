import asyncio
import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.scraping.vendors.startech import StarTechScraper

async def main():
    scraper = StarTechScraper(headless=True) # Run headless for Docker environment
    url = "https://www.startech.com.bd/msi-h310m-pro-vdh-motherboard"
    
    print(f"Fetching {url}...")
    html = await scraper.fetch_page(url)
    
    if html:
        print("Page fetched successfully. Parsing...")
        product = await scraper.parse_product(html, url)
        if product:
            print("\n--- Scraped Product ---")
            print(f"Name: {product.name}")
            print(f"Price: {product.price}")
            print(f"Status: {product.status}")
            print(f"Image: {product.image_url}")
            print("\n--- Specs (Top 5) ---")
            for k, v in list(product.specs.items())[:5]:
                print(f"{k}: {v}")
            
            print("\n--- Raw Data ---")
            if product.raw_data and "html" in product.raw_data:
                print(f"Raw HTML captured: Yes ({len(product.raw_data['html'])} chars)")
            else:
                print("Raw HTML captured: No")

        else:
            print("Failed to parse product.")
    else:
        print("Failed to fetch page.")

if __name__ == "__main__":
    asyncio.run(main())
