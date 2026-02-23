import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import JSON, Column

if TYPE_CHECKING:
    from .user import User
    from .build import Build

class SessionStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    COMPLETED = "completed"

class SessionBase(SQLModel):
    guest_token: Optional[str] = Field(default=None, index=True)
    free_tweaks_remaining: int = Field(default=0)
    preferences: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    current_build: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    status: SessionStatusEnum = Field(default=SessionStatusEnum.ACTIVE)

class Session(SessionBase, table=True):
    __tablename__ = "sessions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

    # Relationships
    user: Optional["User"] = Relationship(back_populates="sessions")
    builds: list["Build"] = Relationship(back_populates="session")
