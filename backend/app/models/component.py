from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum
from datetime import datetime


class ComponentType(str, Enum):
    """Types of PC components."""
    CPU = "cpu"
    MOTHERBOARD = "motherboard"
    RAM = "ram"
    GPU = "gpu"
    STORAGE = "storage"
    PSU = "psu"
    CASE = "case"
    COOLER = "cooler"


class SocketType(str, Enum):
    """CPU socket types."""
    AM5 = "AM5"
    AM4 = "AM4"
    LGA1700 = "LGA1700"
    LGA1200 = "LGA1200"


class FormFactor(str, Enum):
    """Motherboard form factors."""
    ATX = "ATX"
    MICRO_ATX = "mATX"
    MINI_ITX = "ITX"
    E_ATX = "E-ATX"


class RAMType(str, Enum):
    """RAM types."""
    DDR4 = "DDR4"
    DDR5 = "DDR5"


# ============== Base Component ==============

class Component(SQLModel, table=True):
    """Base component table with shared fields."""
    
    __tablename__ = "components"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    image_url: Optional[str] = None
    component_type: ComponentType
    brand: Optional[str] = None
    performance_score: int = Field(default=50, ge=0, le=100)  # For AI builder
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    prices: List["VendorPrice"] = Relationship(back_populates="component")


# ============== CPU ==============

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


# ============== Motherboard ==============

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


# ============== RAM ==============

class RAM(SQLModel, table=True):
    """RAM-specific attributes."""
    
    __tablename__ = "rams"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    component_id: int = Field(foreign_key="components.id", unique=True)
    ram_type: RAMType
    capacity_gb: int
    speed_mhz: int
    modules: int = Field(default=1)  # e.g., 2 for 2x8GB kit
    cas_latency: Optional[int] = None
    rgb: bool = False


# Import VendorPrice at the end to avoid circular imports
from .price import VendorPrice
