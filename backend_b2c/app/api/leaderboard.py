from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from ..database import get_session
from ..models.user import User

router = APIRouter()

class LeaderboardUser(BaseModel):
    display_name: str | None
    total_referrals: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[LeaderboardUser])
def get_leaderboard(limit: int = Query(default=10, ge=1, le=100), db: Session = Depends(get_session)):
    """Fetch the top users by total referrals."""
    statement = (
        select(User)
        .where(User.total_referrals > 0)
        .order_by(User.total_referrals.desc())
        .limit(limit)
    )
    users = db.exec(statement).all()
    
    # Format results
    result = []
    for user in users:
        result.append({
            "display_name": user.display_name or "Anonymous Builder",
            "total_referrals": user.total_referrals
        })
        
    return result
