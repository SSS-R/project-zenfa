from enum import Enum

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

class StorageType(str, Enum):
    """Storage types."""
    NVME = "NVMe"
    SATA = "SATA"
    HDD = "HDD"

class PSUkb(str, Enum):
    """PSU Efficiency Ratings."""
    BRONZE = "80+ Bronze"
    GOLD = "80+ Gold"
    PLATINUM = "80+ Platinum"
    TITANIUM = "80+ Titanium"
    WHITE = "80+ White"
    NONE = "None"
