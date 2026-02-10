from typing import Optional
from sqlmodel import SQLModel, Field

class Laptop(SQLModel, table=True):
    """Laptop attributes."""
    
    __tablename__ = "laptops"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    processor_model: str
    ram_gb: int
    storage_gb: int
    display_size_inch: float
    gpu_model: Optional[str] = None
    battery_capacity_wh: Optional[int] = None
    touch_screen: bool = False
