from typing import Optional
from sqlmodel import SQLModel, Field
from .enums import SocketType

class CPU(SQLModel, table=True):
    """CPU-specific attributes."""
    
    __tablename__ = "cpus"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    socket: SocketType
    core_count: int
    thread_count: int
    base_clock_ghz: float
    boost_clock_ghz: Optional[float] = None
    tdp: int  # Watts
    integrated_graphics: bool = False
    igpu_name: Optional[str] = None
