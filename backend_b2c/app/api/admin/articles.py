from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_session
from app.models.user import User, RoleEnum
from app.models.article import Article, ArticleCreate, ArticleUpdate, ArticleRead, StatusEnum
from app.api.deps import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    return current_user

@router.get("/", response_model=List[ArticleRead])
def get_admin_articles(
    status: Optional[StatusEnum] = None,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Get all articles, optionally filtered by status."""
    query = select(Article)
    if status is not None:
        query = query.where(Article.status == status)
    query = query.order_by(Article.created_at.desc())
    articles = session.exec(query).all()
    return articles

@router.get("/queue", response_model=List[ArticleRead])
def get_article_queue(
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Get only draft articles (review queue)."""
    query = select(Article).where(Article.status == StatusEnum.DRAFT).order_by(Article.created_at.desc())
    articles = session.exec(query).all()
    return articles

@router.post("/", response_model=ArticleRead, status_code=status.HTTP_201_CREATED)
def create_article(
    article_in: ArticleCreate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Create a new article manually."""
    # Check for slug uniqueness
    existing_article = session.exec(select(Article).where(Article.slug == article_in.slug)).first()
    if existing_article:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article with this slug already exists"
        )
    
    article = Article.model_validate(article_in)
    article.author_id = current_user.id
    
    if article.status == StatusEnum.PUBLISHED:
        article.published_at = datetime.utcnow()
        
    session.add(article)
    session.commit()
    session.refresh(article)
    return article

@router.patch("/{article_id}", response_model=ArticleRead)
def update_article(
    article_id: uuid.UUID,
    article_in: ArticleUpdate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Edit article fields."""
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    update_data = article_in.model_dump(exclude_unset=True)
    
    if "status" in update_data:
        if update_data["status"] == StatusEnum.PUBLISHED and article.status != StatusEnum.PUBLISHED:
            update_data["published_at"] = datetime.utcnow()
        elif update_data["status"] == StatusEnum.DRAFT:
            update_data["published_at"] = None

    for key, value in update_data.items():
        setattr(article, key, value)

    session.add(article)
    session.commit()
    session.refresh(article)
    return article

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: uuid.UUID,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Hard delete an article."""
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
        
    session.delete(article)
    session.commit()

@router.patch("/{article_id}/feature", response_model=ArticleRead)
def toggle_feature_article(
    article_id: uuid.UUID,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Toggle is_featured. Auto-unfeatures previous featured articles."""
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
        
    # Unfeature all other articles if this one is being featured
    if not article.is_featured:
        featured_articles = session.exec(select(Article).where(Article.is_featured == True)).all()
        for fa in featured_articles:
            fa.is_featured = False
            session.add(fa)
            
    article.is_featured = not article.is_featured
    session.add(article)
    session.commit()
    session.refresh(article)
    
    return article
