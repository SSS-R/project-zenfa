from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class ScrapedProduct(BaseModel):
    """Normalized product data structure."""
    name: str # e.g. "AMD Ryzen 5 7600"
    original_name: str # The raw title from the store
    price: int # e.g. 24500
    url: str
    vendor: str # "StarTech", "Ryans"
    image_url: Optional[str] = None
    in_stock: bool = True
    scraped_at: datetime = datetime.now()

class BaseScraper(ABC):
    """Abstract base class for all store scrapers."""
    
    def __init__(self, vendor_name: str):
        self.vendor_name = vendor_name

    @abstractmethod
    async def search(self, query: str) -> List[ScrapedProduct]:
        """Search the store for a product."""
        pass

    @abstractmethod
    async def get_price(self, url: str) -> Optional[ScrapedProduct]:
        """Get price details from a specific product URL."""
        pass
    
    def normalize_price(self, price_str: str) -> int:
        """Helper to convert '24,500৳' to integer 24500."""
        try:
            # Remove currency symbols, commas, and whitespace
            clean = price_str.replace('৳', '').replace(',', '').replace('Tk', '').strip()
            return int(float(clean))
        except (ValueError, TypeError):
            return 0
