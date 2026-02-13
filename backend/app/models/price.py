from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, Dict, Any
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    from .component import Component


class VendorName(str, Enum):
    """Supported vendors in Bangladesh."""
    STARTECH = "StarTech"
    RYANS = "Ryans"
    TECHLAND = "TechLand"
    UCC = "UCC"
    SKYLAND = "Skyland"
    NEXUS = "Nexus"


class VendorPrice(SQLModel, table=True):
    """Price tracking for components across vendors."""
    
    __tablename__ = "vendor_prices"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", index=True)
    vendor_name: VendorName
    price_bdt: int  # Price in Bangladeshi Taka
    url: str  # Direct link to product page
    in_stock: bool = True
    raw_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    component: Optional["Component"] = Relationship(back_populates="prices")
    
    class Config:
        # Ensure unique price per component per vendor
        unique_together = [("component_id", "vendor_name")]
