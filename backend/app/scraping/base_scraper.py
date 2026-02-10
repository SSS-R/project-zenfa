from abc import ABC, abstractmethod
from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
import logging
from typing import Optional
from .schemas import ScrapedProduct

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    """Abstract base class for all vendor scrapers."""

    def __init__(self, headless: bool = True):
        self.headless = headless

    async def fetch_page(self, url: str) -> Optional[str]:
        """Fetches the HTML content of a page using Playwright."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            # Use a realistic user agent to avoid detection
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                logger.info(f"Fetching {url}")
                await page.goto(url, timeout=60000, wait_until="domcontentloaded")
                content = await page.content()
                return content
            except Exception as e:
                logger.error(f"Error fetching {url}: {e}")
                return None
            finally:
                await browser.close()

    def parse_html(self, html: str) -> BeautifulSoup:
        """Parses HTML using BeautifulSoup."""
        return BeautifulSoup(html, "html.parser")

    @abstractmethod
    def parse_product(self, html: str, url: str) -> Optional[ScrapedProduct]:
        """Parses the product page HTML and returns a ScrapedProduct object."""
        pass

    def clean_price(self, price_str: str) -> int:
        """Removes currency symbols and commas from price string."""
        if not price_str:
            return 0
        # Remove '৳', ',', and whitespace
        clean_str = price_str.replace("৳", "").replace(",", "").strip()
        try:
            return int(clean_str)
        except ValueError:
            logger.warning(f"Could not parse price: {price_str}")
            return 0
