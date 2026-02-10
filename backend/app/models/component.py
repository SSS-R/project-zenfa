from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from .enums import ComponentType

# ============== Base Component ==============

class Component(SQLModel, table=True):
    """Base component table with shared fields."""
    
    __tablename__ = "components"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    image_url: Optional[str] = None
    component_type: ComponentType
    brand: Optional[str] = None
    performance_score: int = Field(default=50, ge=0, le=100)  # For AI builder
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    prices: List["VendorPrice"] = Relationship(back_populates="component")


# Import VendorPrice at the end to avoid circular imports
from .price import VendorPrice
