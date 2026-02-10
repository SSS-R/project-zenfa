from typing import Optional
from sqlmodel import SQLModel, Field

class CaseFan(SQLModel, table=True):
    """Case Fan attributes."""
    
    __tablename__ = "case_fans"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    size_mm: int
    rpm: Optional[int] = None
    rgb: bool = False
    noise_level_db: Optional[float] = None
