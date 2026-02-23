from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

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
