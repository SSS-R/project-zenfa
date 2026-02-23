import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import JSON, Column

if TYPE_CHECKING:
    from .user import User, RoleEnum

class TicketCategoryEnum(str, enum.Enum):
    PAYMENT = "payment"
    BUILD_ISSUE = "build_issue"
    ACCOUNT = "account"
    OTHER = "other"

class TicketStatusEnum(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriorityEnum(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class SupportTicketBase(SQLModel):
    subject: str
    category: TicketCategoryEnum = Field(default=TicketCategoryEnum.OTHER)
    status: TicketStatusEnum = Field(default=TicketStatusEnum.OPEN)
    priority: TicketPriorityEnum = Field(default=TicketPriorityEnum.NORMAL)

class SupportTicket(SupportTicketBase, table=True):
    __tablename__ = "support_tickets"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

    # Relationships
    user: Optional["User"] = Relationship(back_populates="support_tickets")
    messages: list["SupportMessage"] = Relationship(back_populates="ticket")

class SupportMessageBase(SQLModel):
    message: str
    attachments: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    sender_role: str = Field(default="user") # RoleEnum value as string

class SupportMessage(SupportMessageBase, table=True):
    __tablename__ = "support_messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    ticket_id: uuid.UUID = Field(foreign_key="support_tickets.id")
    sender_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    ticket: "SupportTicket" = Relationship(back_populates="messages")
    sender: Optional["User"] = Relationship(back_populates="support_messages")
