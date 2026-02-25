from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from ...database import get_session
from ...models.user import User, RoleEnum
from ..deps import get_current_admin_user
from ..schemas import UserResponse
from pydantic import BaseModel

class UserUpdateTokens(BaseModel):
    token_balance: int

class UserUpdateRole(BaseModel):
    role: str

router = APIRouter(dependencies=[Depends(get_current_admin_user)])

@router.get("/", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    """List all users (Admin only)."""
    statement = select(User).offset(skip).limit(limit)
    users = db.exec(statement).all()
    return users

@router.patch("/{user_id}/tokens", response_model=UserResponse)
def update_user_tokens(user_id: UUID, req: UserUpdateTokens, db: Session = Depends(get_session)):
    """Manually adjust a user's token balance (Admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.token_balance = req.token_balance
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: UUID, req: UserUpdateRole, db: Session = Depends(get_session)):
    """Change a user's role (Admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        role = RoleEnum(req.role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user.role = role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
