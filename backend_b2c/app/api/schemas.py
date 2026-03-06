from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    referral_code: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: Optional[str] = None
    role: str
    token_balance: int
    referral_code: str
    total_referrals: int
    
    class Config:
        from_attributes = True

from datetime import datetime

class TransactionInitiateRequest(BaseModel):
    package: str
    gateway: str
    gateway_trx_id: Optional[str] = None
    
class TransactionResponse(BaseModel):
    id: UUID
    amount_bdt: float
    package: str
    tokens_granted: int
    status: str
    gateway: str
    gateway_trx_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SupportMessageCreate(BaseModel):
    message: str
    
class SupportMessageResponse(BaseModel):
    id: UUID
    message: str
    sender_role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SupportTicketCreate(BaseModel):
    subject: str
    category: str
    priority: Optional[str] = "normal"

class SupportTicketResponse(BaseModel):
    id: UUID
    subject: str
    category: str
    status: str
    priority: str
    created_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True
        
class SupportTicketDetailResponse(SupportTicketResponse):
    messages: list[SupportMessageResponse] = []
    
    class Config:
        from_attributes = True
