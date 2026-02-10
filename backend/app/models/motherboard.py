from typing import Optional
from sqlmodel import SQLModel, Field
from .enums import SocketType, FormFactor, RAMType

class Motherboard(SQLModel, table=True):
    """Motherboard-specific attributes."""
    
    __tablename__ = "motherboards"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    socket: SocketType
    form_factor: FormFactor
    ram_type: RAMType
    ram_slots: int = Field(default=4)
    max_ram_gb: int = Field(default=128)
    chipset: Optional[str] = None
    pcie_x16_slots: int = Field(default=1)
    m2_slots: int = Field(default=1)
