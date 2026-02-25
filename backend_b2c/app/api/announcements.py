from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models.announcement import Announcement, AnnouncementResponse

router = APIRouter()

@router.get("/", response_model=List[AnnouncementResponse])
def get_active_announcements(db: Session = Depends(get_session)):
    """Get all currently active system announcements for the public/users."""
    statement = select(Announcement).where(Announcement.is_active == True).order_by(Announcement.created_at.desc())
    return db.exec(statement).all()
