from sqlmodel import Field, SQLModel
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel

class AnnouncementBase(SQLModel):
    title: str = Field(index=True)
    message: str
    is_active: bool = Field(default=True)
    type: str = Field(default="info") # info, warning, success, error

class Announcement(AnnouncementBase, table=True):
    __tablename__ = "announcements"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    is_active: Optional[bool] = None
    type: Optional[str] = None

class AnnouncementResponse(AnnouncementBase):
    id: UUID
    created_at: datetime
