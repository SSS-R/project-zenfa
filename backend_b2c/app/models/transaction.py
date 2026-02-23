import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User

class GatewayEnum(str, enum.Enum):
    BKASH = "bkash"
    NAGAD = "nagad"
    AAMARPAY = "aamarpay"
    MANUAL = "manual"
    FREE = "free"

class PackageEnum(str, enum.Enum):
    STARTER = "starter"
    PRO = "pro"
    ENTHUSIAST = "enthusiast"

class TransactionStatusEnum(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

class TransactionBase(SQLModel):
    gateway: GatewayEnum = Field(default=GatewayEnum.MANUAL)
    amount_bdt: float = Field(default=0.0)
    package: PackageEnum
    tokens_granted: int = Field(default=0)
    status: TransactionStatusEnum = Field(default=TransactionStatusEnum.PENDING)
    gateway_trx_id: Optional[str] = Field(default=None, index=True)

class Transaction(TransactionBase, table=True):
    __tablename__ = "transactions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="transactions")
