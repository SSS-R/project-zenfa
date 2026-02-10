from typing import Optional, List
from sqlmodel import SQLModel, Field, JSON
from .enums import CoolerType

class CPUCooler(SQLModel, table=True):
    """CPU Cooler attributes (Air & Liquid)."""
    
    __tablename__ = "cpu_coolers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    cooler_type: CoolerType
    fan_size_mm: Optional[int] = None
    radiator_size_mm: Optional[int] = None # For Liquid coolers
    tdp_capacity_watts: Optional[int] = None
    # Store supported sockets as a JSON list ["AM5", "LGA1700"]
    socket_support: List[str] = Field(default=[], sa_type=JSON)
