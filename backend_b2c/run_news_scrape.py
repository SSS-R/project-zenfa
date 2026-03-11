import asyncio
import logging
from app.services.news.rss_scraper import scrape_all_feeds
from app.services.news.reddit_scraper import scrape_hot_posts
from app.services.news.vendor_scraper import scrape_vendor_blogs

logging.basicConfig(level=logging.INFO)

async def main():
    print("🚀 Triggering Manual News Scrape...")
    
    print("\n--- 1. Scraping RSS Feeds (VideoCardz, TechPowerUp) ---")
    await scrape_all_feeds()
    
    print("\n--- 2. Scraping Reddit Hot Posts ---")
    await scrape_hot_posts()
    
    # print("\n--- 3. Scraping Vendor Promotions ---")
    # await scrape_vendor_blogs()
    
    print("\n✅ All News Scraping Completed!")

if __name__ == "__main__":
    asyncio.run(main())
