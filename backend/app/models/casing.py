from typing import Optional, List
from sqlmodel import SQLModel, Field, JSON

class Casing(SQLModel, table=True):
    """PC Case attributes."""
    
    __tablename__ = "casings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    max_gpu_length_mm: int
    max_cpu_cooler_height_mm: int
    psu_support: Optional[str] = None # e.g. ATX
    # Store supported form factors as a JSON list ["ATX", "mATX"]
    form_factor_support: List[str] = Field(default=[], sa_type=JSON) 
