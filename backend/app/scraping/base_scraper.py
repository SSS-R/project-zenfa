from abc import ABC, abstractmethod
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from bs4 import BeautifulSoup
import logging
import random
import asyncio
from typing import Optional, Dict, List
from .schemas import ScrapedProduct
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    """Advanced anti-detection base class for all vendor scrapers."""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser = None
        self.contexts = []
        self.current_context_index = 0
        self.request_count = 0
        self.session_start = asyncio.get_event_loop().time() if asyncio.get_event_loop().is_running() else 0
        
        # Anti-detection configurations
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ]
        
        self.viewport_sizes = [
            {"width": 1920, "height": 1080},
            {"width": 1366, "height": 768},
            {"width": 1440, "height": 900},
            {"width": 1536, "height": 864},
            {"width": 1280, "height": 720}
        ]
        
    async def _initialize_browser_pool(self):
        """Initialize browser with multiple contexts for session rotation"""
        if not self.browser:
            playwright = await async_playwright().start()
            
            # Advanced browser launch options
            self.browser = await playwright.chromium.launch(
                headless=self.headless,
                args=[
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-first-run",
                    "--disable-extensions",
                    "--disable-default-apps",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--disable-features=TranslateUI,BlinkGenPropertyTrees"
                ]
            )
            
            # Create multiple contexts with different configurations
            for i in range(3):
                context = await self._create_stealth_context()
                self.contexts.append(context)
    
    async def _create_stealth_context(self) -> BrowserContext:
        """Create a stealth browser context with randomized fingerprint"""
        user_agent = random.choice(self.user_agents)
        viewport = random.choice(self.viewport_sizes)
        
        # Advanced context options for better stealth
        context = await self.browser.new_context(
            user_agent=user_agent,
            viewport=viewport,
            locale="en-US",
            timezone_id="America/New_York",
            permissions=["geolocation"],
            color_scheme="light",
            reduced_motion="no-preference",
            forced_colors="none",
            extra_http_headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
        )
        
        # Add stealth script to hide automation
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            window.chrome = {
                runtime: {},
                // etc.
            };
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
            
            const originalQuery = window.navigator.permissions.query;
            return window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        """)
        
        return context
    
    async def _get_page(self) -> Page:
        """Get a page from current context with session rotation"""
        await self._initialize_browser_pool()
        
        # Rotate context every 10-15 requests to avoid fingerprinting
        if self.request_count > 0 and self.request_count % random.randint(10, 15) == 0:
            self.current_context_index = (self.current_context_index + 1) % len(self.contexts)
            logger.info(f"Rotating to context {self.current_context_index}")
        
        context = self.contexts[self.current_context_index]
        return await context.new_page()
    
    async def _calculate_smart_delay(self, base_delay: float = 1.0) -> float:
        """Calculate intelligent delay based on request patterns and timing"""
        # Base random delay
        delay = random.uniform(base_delay * 0.8, base_delay * 1.5)
        
        # Add extra delay for burst protection
        if self.request_count % 5 == 0:
            delay += random.uniform(2, 4)
        
        # Add extra delay for sustained scraping
        current_time = asyncio.get_event_loop().time()
        if current_time - self.session_start > 300:  # After 5 minutes
            delay += random.uniform(1, 2)
        
        return delay

    async def fetch_page(self, url: str, retries: int = 2) -> Optional[str]:
        """Enhanced page fetching with anti-detection measures"""
        for attempt in range(retries + 1):
            try:
                # Smart delay before request
                if self.request_count > 0:
                    delay = await self._calculate_smart_delay()
                    await asyncio.sleep(delay)
                
                page = await self._get_page()
                self.request_count += 1
                
                # Randomize navigation behavior
                await page.set_extra_http_headers({
                    "Referer": "https://www.google.com/" if random.random() < 0.3 else "",
                    "Cache-Control": "no-cache" if random.random() < 0.1 else "max-age=0"
                })
                
                logger.info(f"Fetching {url} (attempt {attempt + 1})")
                
                # Navigate with realistic options
                response = await page.goto(
                    url, 
                    timeout=45000, 
                    wait_until="domcontentloaded"
                )
                
                if response and response.status == 200:
                    # Simulate human behavior
                    await asyncio.sleep(random.uniform(0.5, 2.0))
                    
                    # Random scroll simulation
                    if random.random() < 0.3:
                        await page.evaluate("window.scrollTo(0, Math.random() * 500)")
                        await asyncio.sleep(random.uniform(0.2, 0.8))
                    
                    content = await page.content()
                    await page.close()
                    return content
                else:
                    logger.warning(f"HTTP {response.status if response else 'No response'} for {url}")
                    
            except Exception as e:
                logger.error(f"Error fetching {url} (attempt {attempt + 1}): {e}")
                if attempt < retries:
                    # Exponential backoff for retries
                    await asyncio.sleep(random.uniform(3, 8) * (attempt + 1))
                    continue
            
            finally:
                try:
                    await page.close()
                except:
                    pass
        
        return None
    
    async def cleanup(self):
        """Cleanup browser resources"""
        if self.browser:
            await self.browser.close()
            self.browser = None
            self.contexts = []

    def parse_html(self, html: str) -> BeautifulSoup:
        """Parses HTML using BeautifulSoup."""
        return BeautifulSoup(html, "html.parser")

    @abstractmethod
    def parse_product(self, html: str, url: str) -> Optional[ScrapedProduct]:
        """Parses the product page HTML and returns a ScrapedProduct object."""
        pass

    @abstractmethod
    def extract_product_urls(self, html: str) -> list[str]:
        """Extracts product URLs from a category page HTML."""
        pass

    @abstractmethod
    def extract_next_page_url(self, html: str) -> Optional[str]:
        """Extracts the URL of the next page from a category page HTML."""
        pass

    def clean_price(self, price_str: str) -> int:
        """Removes currency symbols and commas from price string. Prioritizes Bangladeshi Taka (৳)."""
        if not price_str:
            return 0
        # Remove '৳' (Bangladeshi Taka - primary currency), ',', and whitespace
        # Also handle other symbols as fallback
        clean_str = price_str.replace("৳", "").replace(",", "").replace("$", "").replace("Rs.", "").replace("₹", "").strip()
        try:
            return int(float(clean_str))
        except ValueError:
            logger.warning(f"Could not parse price: {price_str}")
            return 0
