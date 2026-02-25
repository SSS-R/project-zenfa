from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from ..database import get_session
from .deps import get_current_user
from ..models.user import User
from ..services.auth_service import verify_password, get_password_hash, create_access_token
from .schemas import UserCreate, UserLogin, Token, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_session)):
    """Register a new user."""
    # Check if user exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = db.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Check referral code
    referrer = None
    if user_data.referral_code:
        statement = select(User).where(User.referral_code == user_data.referral_code)
        referrer = db.exec(statement).first()

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        display_name=user_data.display_name,
        referred_by=referrer.id if referrer else None,
        # Give 10 free tokens for the first guest build + 10 bonus if referred!
        token_balance=20 if referrer else 10 
    )
    
    db.add(new_user)
    
    # Reward the referrer
    if referrer:
        referrer.token_balance += 10
        referrer.total_referrals += 1
        db.add(referrer)

    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_session)):
    """Authenticate user and return JWT."""
    statement = select(User).where(User.email == user_data.email)
    user = db.exec(statement).first()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Update last login
    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile details."""
    return current_user
