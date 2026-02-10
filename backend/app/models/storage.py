from typing import Optional
from sqlmodel import SQLModel, Field
from .enums import StorageType

class Storage(SQLModel, table=True):
    """Storage-specific attributes."""
    
    __tablename__ = "storages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    storage_type: StorageType
    capacity_gb: int
    # read_speed_mbps: Optional[int] = None
    # write_speed_mbps: Optional[int] = None
