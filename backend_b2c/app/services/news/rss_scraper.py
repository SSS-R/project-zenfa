import feedparser
from sqlmodel import Session, select
from datetime import datetime
import asyncio
from typing import List, Dict, Optional

from app.database import engine
from app.models.article import Article, StatusEnum, CategoryEnum, SourceEnum
from app.services.news.summarizer import summarize_article

FEEDS = [
    {"url": "https://videocardz.com/feed", "default_category": CategoryEnum.GPU, "source_name": "VideoCardz"},
    {"url": "https://www.techpowerup.com/rss/news", "default_category": None, "source_name": "TechPowerUp"},
    {"url": "https://www.tomshardware.com/feeds/all", "default_category": None, "source_name": "Tom's Hardware"}
]

def clean_url(url: str) -> str:
    """Removes trailing slashes and tracking query params."""
    url = url.split("?")[0]
    return url.rstrip("/")

def auto_categorize(title: str, summary_content: str, default: Optional[CategoryEnum]) -> CategoryEnum:
    """Auto categorize based on keywords if no default is provided."""
    text = f"{title} {summary_content}".lower()
    
    if default:
        return default
    elif any(k in text for k in ["gpu", "rtx", "rx", "nvidia", "radeon", "graphics"]):
        return CategoryEnum.GPU
    elif any(k in text for k in ["cpu", "ryzen", "core i", "intel", "processor", "epyc"]):
        return CategoryEnum.CPU
    elif any(k in text for k in ["ddr", "ssd", "memory", "storage", "nvme"]):
        return CategoryEnum.RAM_STORAGE
    elif any(k in text for k in ["benchmark", "review", "tested"]):
        return CategoryEnum.BENCHMARKS
    elif any(k in text for k in ["price", "deal", "drops", "cheap", "sale"]):
        return CategoryEnum.DEALS
    return CategoryEnum.BD_NEWS # Fallback

def extract_thumbnail(entry) -> Optional[str]:
    """Tries to find image urls in RSS feeds."""
    if hasattr(entry, 'media_content') and len(entry.media_content) > 0:
        return entry.media_content[0].get('url')
    
    if hasattr(entry, 'enclosures'):
        for enc in entry.enclosures:
            if 'image' in getattr(enc, 'type', ''):
                return enc.get('href')
                
    # Parse description fallback for img tags but simpler
    return None

async def process_feed(session: Session, feed_info: Dict):
    """Processes a single RSS feed."""
    url = feed_info["url"]
    feed = await asyncio.to_thread(feedparser.parse, url)
    print(f"[{feed_info['source_name']}] Parsed {len(feed.entries)} entries.")
    
    for entry in feed.entries:
        try:
            raw_url = getattr(entry, 'link', None)
            if not raw_url:
                continue
                
            clean_source_url = clean_url(raw_url)
            title = getattr(entry, 'title', 'Untitled')
            
            # 1. Deduplication check
            exists = session.exec(select(Article).where(Article.source_url == clean_source_url)).first()
            if exists:
                continue # Skip duplicate
            
            content = getattr(entry, 'description', '')
            thumbnail = extract_thumbnail(entry)
            cat_hint = auto_categorize(title, content, feed_info.get("default_category"))
            
            # 2. Extract and AI Summarize
            summary = await summarize_article(title, clean_source_url, content, cat_hint.value)
            
            # Base values if AI generation fails
            excerpt = content[:200] + "..." if content else "A tech news article."
            body = content if content else excerpt
            final_cat = cat_hint
            
            if summary:
                # Use AI values
                excerpt = summary.get("excerpt", excerpt)
                body = summary.get("body", body)
                ai_cat = summary.get("category", final_cat.value)
                try: # Validate category from AI matches models
                    final_cat = CategoryEnum(ai_cat.lower())
                except ValueError:
                    pass

            from slugify import slugify # Need python-slugify or write a simple custom one
            import re
            
            base_slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title).strip().lower()
            base_slug = re.sub(r'[-\s]+', '-', base_slug)
            
            # 3. Create Draft Entity
            article = Article(
                title=title,
                slug=f"{base_slug}-{datetime.now().strftime('%M%S')}",
                excerpt=excerpt,
                body=body,
                category=final_cat,
                status=StatusEnum.DRAFT,
                source=SourceEnum.RSS,
                source_url=clean_source_url,
                source_name=feed_info["source_name"],
                thumbnail_url=thumbnail
            )
            session.add(article)
            session.commit()
            print(f"[{feed_info['source_name']}] Created Draft: {title}")
            
        except Exception as e:
            print(f"Error processing entry {getattr(entry, 'title', raw_url)}: {e}")
            session.rollback()

async def scrape_all_feeds():
    """Scrape all defined feeds sequentially."""
    print("Starting RSS Scraping sequence...")
    with Session(engine) as session:
        for feed in FEEDS:
            await process_feed(session, feed)
    print("Finished RSS Scraping sequence.")
