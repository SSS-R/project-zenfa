from typing import Optional
from sqlmodel import SQLModel, Field, JSON
from .enums import PeripheralType

class Peripheral(SQLModel, table=True):
    """Generic model for Peripherals (Keyboard, Mouse, Headphone, UPS)."""
    
    __tablename__ = "peripherals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    peripheral_type: PeripheralType
    connection_type: Optional[str] = None # Wired, Wireless, Bluetooth
    # Store arbitrary specs as JSON {"switch_type": "Cherry MX Red", "dpi": 16000}
    specifications: dict = Field(default={}, sa_type=JSON) 
