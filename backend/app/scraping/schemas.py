from typing import Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class ScrapedProduct(BaseModel):
    """Data structure for a scraped product before database insertion."""
    name: str
    vendor: str
    price: int
    url: str
    image_url: Optional[str] = None
    status: str  # "In Stock", "Out of Stock", etc.
    specs: Dict[str, Any] = {}  # Key-value pairs of specifications
    scraped_at: datetime = datetime.utcnow()
