from typing import Optional
from sqlmodel import SQLModel, Field
from .enums import MonitorPanelType

class Monitor(SQLModel, table=True):
    """Monitor attributes."""
    
    __tablename__ = "monitors"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    screen_size_inch: float
    resolution: str
    refresh_rate_hz: int
    panel_type: Optional[MonitorPanelType] = None
    response_time_ms: Optional[float] = None
    curved: bool = False
