from typing import Optional
from sqlmodel import SQLModel, Field
from .enums import PSUkb

class PSU(SQLModel, table=True):
    """PSU-specific attributes."""
    
    __tablename__ = "psus"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    wattage: int
    efficiency_rating: PSUkb = Field(default=PSUkb.NONE)
    modular: bool = False
