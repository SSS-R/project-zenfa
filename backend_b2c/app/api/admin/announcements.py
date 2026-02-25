from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from ...database import get_session
from ...models.announcement import Announcement, AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from ..deps import get_current_admin_user

router = APIRouter(dependencies=[Depends(get_current_admin_user)])

# We also need a public route, but we'll put it in a separate public API file or just expose it without auth
# Actually, let's just create a public endpoint in the main or a public file.
# For now, these are the ADMIN management routes.

@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    req: AnnouncementCreate, 
    db: Session = Depends(get_session)
):
    """Create a new system-wide announcement."""
    announcement = Announcement.model_validate(req)
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement

@router.get("/", response_model=List[AnnouncementResponse])
def list_announcements(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_session)
):
    """List all announcements (admin view)."""
    statement = select(Announcement).order_by(Announcement.created_at.desc()).offset(skip).limit(limit)
    return db.exec(statement).all()

@router.patch("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID, 
    req: AnnouncementUpdate, 
    db: Session = Depends(get_session)
):
    """Update an announcement (e.g., to deactivate it)."""
    announcement = db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(announcement, key, value)
        
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement

@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: UUID, 
    db: Session = Depends(get_session)
):
    """Delete an announcement completely."""
    announcement = db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    db.delete(announcement)
    db.commit()
    return None
