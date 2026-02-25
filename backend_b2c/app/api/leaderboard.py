from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from ..database import get_session
from ..models.user import User

router = APIRouter()

class LeaderboardUser(BaseModel):
    display_name: str | None
    email: str
    total_referrals: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[LeaderboardUser])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_session)):
    """Fetch the top users by total referrals."""
    statement = (
        select(User)
        .where(User.total_referrals > 0)
        .order_by(User.total_referrals.desc())
        .limit(limit)
    )
    users = db.exec(statement).all()
    
    # Mask emails for privacy since this might be a public board
    result = []
    for user in users:
        masked_email = user.email.split("@")[0][:3] + "***@" + user.email.split("@")[1] if "@" in user.email else "Hidden"
        result.append({
            "display_name": user.display_name or "Anonymous Builder",
            "email": masked_email,
            "total_referrals": user.total_referrals
        })
        
    return result
