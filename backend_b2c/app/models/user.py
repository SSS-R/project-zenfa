import enum
import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import EmailStr
from sqlmodel import Field, SQLModel, Relationship

class RoleEnum(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPPORT = "support"

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True)
    role: RoleEnum = Field(default=RoleEnum.USER)
    is_verified: bool = Field(default=False)
    display_name: Optional[str] = None
    phone: Optional[str] = None
    token_balance: int = Field(default=0)

class User(UserBase, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: Optional[str] = None
    google_id: Optional[str] = Field(default=None, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    # Relationships
    sessions: List["Session"] = Relationship(back_populates="user")
    builds: List["Build"] = Relationship(back_populates="user")
    transactions: List["Transaction"] = Relationship(back_populates="user")
    support_tickets: List["SupportTicket"] = Relationship(back_populates="user")
    support_messages: List["SupportMessage"] = Relationship(back_populates="sender")
