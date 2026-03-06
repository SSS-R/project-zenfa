import httpx
from sqlmodel import Session, select
from datetime import datetime
from typing import Dict, List
import re

from app.database import engine
from app.models.article import Article, StatusEnum, CategoryEnum, SourceEnum

REDDIT_SOURCES = [
    {"subreddit": "buildapc", "url": "https://www.reddit.com/r/buildapc/hot.json?limit=10", "category": CategoryEnum.BD_NEWS}, # BD News is fallback
    {"subreddit": "hardware", "url": "https://www.reddit.com/r/hardware/hot.json?limit=10", "category": CategoryEnum.BD_NEWS},
    {"subreddit": "pcgaming", "url": "https://www.reddit.com/r/pcgaming/hot.json?limit=10", "category": CategoryEnum.BD_NEWS}
]

HEADERS = {
    "User-Agent": "PCLagbeNewsBot/1.0 (Contact: admin@pclagbe.com)"
}

async def fetch_reddit_posts(url: str) -> List[Dict]:
    """Fetches hot posts from a reddit json endpoint."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=HEADERS, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("children", [])
        except Exception as e:
            print(f"Error fetching from Reddit {url}: {e}")
            return []

async def process_reddit_post(session: Session, post_data: Dict, source_info: Dict):
    """Processes and saves a single reddit post if it meets criteria."""
    post = post_data.get("data", {})
    score = post.get("score", 0)
    
    if score < 100:
        return # Skip low quality posts
        
    permalink = post.get("permalink", "")
    source_url = f"https://www.reddit.com{permalink}"
    
    # 1. Deduplication Check
    exists = session.exec(select(Article).where(Article.source_url == source_url)).first()
    if exists:
        return # Skip duplicate
        
    title = post.get("title", "Reddit Thread")
    selftext = post.get("selftext", "")
    url = post.get("url", "")
    
    # Generate content structure
    excerpt = selftext[:200] + "..." if selftext else title
    body = selftext if selftext else f"Discussion thread: {url}"
    
    # Image extraction if available
    thumbnail = None
    if "preview" in post:
        try:
            images = post["preview"].get("images", [])
            if images:
                thumbnail = images[0]["source"]["url"].replace("&amp;", "&")
        except Exception:
            pass

    # Simple slugify
    base_slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title).strip().lower()
    slug = re.sub(r'[-\s]+', '-', base_slug) + f"-{datetime.now().strftime('%M%S')}"
    
    # Target fallback category based on title 
    text_check = f"{title} {selftext}".lower()
    category = source_info["category"]
    if "gpu" in text_check or "rtx" in text_check or "rx" in text_check:
        category = CategoryEnum.GPU
    elif "cpu" in text_check or "ryzen" in text_check or "core" in text_check:
        category = CategoryEnum.CPU
    
    try:
        article = Article(
            title=title,
            slug=slug,
            excerpt=excerpt,
            body=body,
            category=category,
            status=StatusEnum.DRAFT,
            source=SourceEnum.REDDIT,
            source_url=source_url,
            source_name=f"r/{source_info['subreddit']}",
            thumbnail_url=thumbnail
        )
        session.add(article)
        session.commit()
        print(f"[Reddit - r/{source_info['subreddit']}] Saved: {title}")
    except Exception as e:
        print(f"Error saving Reddit post {title}: {e}")
        session.rollback()

async def scrape_hot_posts():
    """Main task to scrape all defined subreddits."""
    print("Starting Reddit scrape...")
    with Session(engine) as session:
        for source in REDDIT_SOURCES:
            posts = await fetch_reddit_posts(source["url"])
            print(f"[Reddit - r/{source['subreddit']}] Fetched {len(posts)} posts.")
            
            for post_data in posts:
                await process_reddit_post(session, post_data, source)
    print("Finished Reddit scrape.")
