import httpx
from bs4 import BeautifulSoup
from sqlmodel import Session, select
from datetime import datetime
import re

from app.database import engine
from app.models.article import Article, StatusEnum, CategoryEnum, SourceEnum

HEADERS = {
    "User-Agent": "PCLagbe-VendorSync/1.0",
}

def clean_slug(title: str) -> str:
    base = re.sub(r'[^a-zA-Z0-9\s-]', '', title).strip().lower()
    return re.sub(r'[-\s]+', '-', base) + f"-{datetime.now().strftime('%M%S')}"

async def scrape_startech_blog(session: Session):
    """Scrapes the latest blog posts from StarTech's blog page."""
    url = "https://www.startech.com.bd/blog"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=HEADERS, timeout=10.0)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Simple selector based on common blog structures, modify if needed
            articles = soup.select(".blog-item") or soup.select("article")
            
            print(f"[Vendor - StarTech] Found {len(articles)} articles.")
            
            for article in articles:
                # Find link and title
                a_tag = article.find("a")
                if not a_tag or not a_tag.get("href"):
                    continue
                    
                article_url = a_tag["href"]
                if not article_url.startswith("http"):
                    article_url = "https://www.startech.com.bd" + article_url
                    
                # Dedup
                exists = session.exec(select(Article).where(Article.source_url == article_url)).first()
                if exists:
                    continue
                    
                title = a_tag.text.strip() or "StarTech Update"
                
                # Excerpt
                excerpt_tag = article.find("p")
                excerpt = excerpt_tag.text.strip()[:200] + "..." if excerpt_tag else title
                
                # Image
                img_tag = article.find("img")
                thumbnail = img_tag.get("src") if img_tag else None
                
                new_article = Article(
                    title=title,
                    slug=clean_slug(title),
                    excerpt=excerpt,
                    body=f"Read more on StarTech: {article_url}",
                    category=CategoryEnum.DEALS,
                    status=StatusEnum.DRAFT,
                    source=SourceEnum.VENDOR,
                    source_url=article_url,
                    source_name="StarTech.com.bd",
                    thumbnail_url=thumbnail
                )
                session.add(new_article)
                session.commit()
                print(f"[Vendor - StarTech] Saved: {title}")
                
        except Exception as e:
            print(f"Error scraping StarTech: {e}")
            session.rollback()

async def scrape_vendor_blogs():
    """Main job to scrape vendor blogs."""
    print("Starting Vendor Blog scrape...")
    with Session(engine) as session:
        await scrape_startech_blog(session)
        # Add ryans computers etc. here using similar patterns
    print("Finished Vendor Blog scrape.")
