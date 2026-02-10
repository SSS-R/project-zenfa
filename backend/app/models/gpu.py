from typing import Optional
from sqlmodel import SQLModel, Field

class GPU(SQLModel, table=True):
    """GPU-specific attributes."""
    
    __tablename__ = "gpus"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    vram_gb: int
    length_mm: int
    recommended_psu_wattage: int
