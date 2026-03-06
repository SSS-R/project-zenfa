import enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Index, Column, Text

if TYPE_CHECKING:
    from .user import User

class CategoryEnum(str, enum.Enum):
    GPU = "gpu"
    CPU = "cpu"
    RAM_STORAGE = "ram_storage"
    DEALS = "deals"
    BENCHMARKS = "benchmarks"
    BD_NEWS = "bd_news"

class StatusEnum(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class SourceEnum(str, enum.Enum):
    ADMIN = "admin"
    RSS = "rss"
    REDDIT = "reddit"
    VENDOR = "vendor"

class ArticleBase(SQLModel):
    title: str = Field(index=True)
    slug: str = Field(index=True, unique=True)
    excerpt: str
    body: str = Field(sa_column=Column(Text))
    category: CategoryEnum
    status: StatusEnum = Field(default=StatusEnum.DRAFT)
    source: SourceEnum
    source_url: Optional[str] = Field(default=None, unique=True)
    source_name: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: bool = Field(default=False)
    is_hot: bool = Field(default=False)
    read_time_minutes: int = Field(default=1)
    view_count: int = Field(default=0)
    author_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")

class Article(ArticleBase, table=True):
    __tablename__ = "articles"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    
    # Relationships
    author: Optional["User"] = Relationship(back_populates="articles")

    __table_args__ = (
        Index("ix_articles_status_published_at", "status", "published_at"),
        Index("ix_articles_category_status", "category", "status"),
    )

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(SQLModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    category: Optional[CategoryEnum] = None
    status: Optional[StatusEnum] = None
    source: Optional[SourceEnum] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_hot: Optional[bool] = None
    read_time_minutes: Optional[int] = None
    published_at: Optional[datetime] = None

class ArticleRead(ArticleBase):
    id: uuid.UUID
    created_at: datetime
    published_at: Optional[datetime] = None
