from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_session
from app.models.article import Article, ArticleRead, StatusEnum, CategoryEnum

router = APIRouter()

@router.get("/headlines", response_model=List[ArticleRead])
def get_article_headlines(
    session: Session = Depends(get_session)
):
    """Returns top 6 published articles for the landing page news ticker."""
    query = select(Article).where(Article.status == StatusEnum.PUBLISHED).order_by(Article.published_at.desc()).limit(6)
    articles = session.exec(query).all()
    # In production, this should have Cache-Control headers for 5 min cache
    return articles

@router.get("/featured", response_model=ArticleRead)
def get_featured_article(
    session: Session = Depends(get_session)
):
    """Returns the single active featured article."""
    query = select(Article).where(Article.is_featured == True).where(Article.status == StatusEnum.PUBLISHED).limit(1)
    article = session.exec(query).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No featured article found")
    return article

@router.get("/{slug}", response_model=ArticleRead)
def get_article_by_slug(
    slug: str,
    session: Session = Depends(get_session)
):
    """Get single article by slug and increment view count."""
    query = select(Article).where(Article.slug == slug).where(Article.status == StatusEnum.PUBLISHED)
    article = session.exec(query).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
        
    article.view_count += 1
    session.add(article)
    session.commit()
    session.refresh(article)
    return article

@router.get("/", response_model=List[ArticleRead])
def get_public_articles(
    category: Optional[CategoryEnum] = Query(None),
    source: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("latest", regex="^(latest|popular)$"),
    session: Session = Depends(get_session)
):
    """Get paginated and filtered article list."""
    query = select(Article).where(Article.status == StatusEnum.PUBLISHED)
    
    if category:
        query = query.where(Article.category == category)
    if source:
        query = query.where(Article.source == source)
        
    if sort == "popular":
        query = query.order_by(Article.view_count.desc())
    else:
        query = query.order_by(Article.published_at.desc())
        
    query = query.offset((page - 1) * limit).limit(limit)
    articles = session.exec(query).all()
    return articles
