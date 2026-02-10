from typing import Optional
from sqlmodel import SQLModel, Field
from .enums import RAMType

class RAM(SQLModel, table=True):
    """RAM-specific attributes."""
    
    __tablename__ = "rams"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    ram_type: RAMType
    capacity_gb: int
    speed_mhz: int
    modules: int = Field(default=1)  # e.g., 2 for 2x8GB kit
    cas_latency: Optional[int] = None
    rgb: bool = False
