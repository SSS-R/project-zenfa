import asyncio
import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.scraping.vendors.skyland import SkylandScraper

async def main():
    scraper = SkylandScraper(headless=True) # Run headless for Docker environment
    url = "https://www.skyland.com.bd/amd-ryzen-5-5600g-processor" # Trying another CPU
    
    print(f"Fetching {url}...")
    try:
        html = await scraper.fetch_page(url)
    except Exception as e:
        print(f"Error fetching page: {e}")
        return

    if html:
        print(f"Page fetched successfully ({len(html)} bytes). Parsing...")
        try:
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
            else:
                print("Failed to parse product.")
        except Exception as e:
            print(f"Error parsing product: {e}")
            # DEBUG: Print HTML snippet
            print(f"HTML Snippet: {html[:500]}")
    else:
        print("Failed to fetch page (returned None).")

if __name__ == "__main__":
    asyncio.run(main())
