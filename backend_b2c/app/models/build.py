import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import JSON, Column

if TYPE_CHECKING:
    from .user import User
    from .session import Session

class BuildBase(SQLModel):
    total_price: float = Field(default=0.0)
    share_slug: Optional[str] = Field(default=None, unique=True, index=True)
    is_public: bool = Field(default=False)
    build_data: Optional[dict] = Field(default=None, sa_column=Column(JSON))

class Build(BuildBase, table=True):
    __tablename__ = "builds"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    session_id: Optional[uuid.UUID] = Field(default=None, foreign_key="sessions.id")
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="builds")
    session: Optional["Session"] = Relationship(back_populates="builds")
