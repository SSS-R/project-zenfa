from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore
import logging

from app.config import get_settings
from app.services.news.rss_scraper import scrape_all_feeds
from app.services.news.reddit_scraper import scrape_hot_posts
from app.services.news.vendor_scraper import scrape_vendor_blogs

# Configure logging
logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.INFO)

settings = get_settings()

jobstores = {
    'default': MemoryJobStore()
}

scheduler = AsyncIOScheduler(jobstores=jobstores)

def setup_scheduler():
    """Sets up the scheduled background jobs for the news pipeline."""
    
    # RSS Scraper Job
    scheduler.add_job(
        scrape_all_feeds,
        trigger=IntervalTrigger(hours=settings.rss_scrape_interval_hours),
        id='rss_scraper_job',
        name='Scrape RSS Feeds',
        replace_existing=True
    )
    
    # Reddit Scraper Job
    scheduler.add_job(
        scrape_hot_posts,
        trigger=IntervalTrigger(hours=settings.reddit_scrape_interval_hours),
        id='reddit_scraper_job',
        name='Scrape Reddit Hot Posts',
        replace_existing=True
    )
    
    # Vendor Scraper Job
    scheduler.add_job(
        scrape_vendor_blogs,
        trigger=IntervalTrigger(hours=settings.vendor_scrape_interval_hours),
        id='vendor_scraper_job',
        name='Scrape Vendor Blogs',
        replace_existing=True
    )
    
    print("News Pipeline Scheduler Setup Complete.")

def start_scheduler():
    """Starts the asyncio scheduler."""
    if not scheduler.running:
        setup_scheduler()
        scheduler.start()
        print("Scheduler Started.")

def shutdown_scheduler():
    """Shuts down the scheduler gracefuly."""
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler Shutdown.")
