from bs4 import BeautifulSoup
from typing import Optional, Dict
import re
from ..base_scraper import BaseScraper
from ..schemas import ScrapedProduct

from urllib.parse import urljoin

class StarTechScraper(BaseScraper):
    """Scraper for StarTech website."""

    VENDOR_NAME = "StarTech"

    def extract_product_urls(self, html: str) -> list[str]:
        """Extracts product URLs from StarTech category page."""
        soup = self.parse_html(html)
        urls = []
        
        # StarTech uses multiple selectors depending on page layout
        # Try multiple selectors for better compatibility with storage/case pages
        selectors = [
            ".p-item .p-item-name a",          # Standard product listing
            ".product-item .product-name a",    # Alternative layout
            ".product-thumb .name a",           # Thumbnail view
            ".item .product-title a",           # Grid view
            "h4.name a",                        # Simple list view
            ".product-layout .name a"           # Category page layout
        ]
        
        for selector in selectors:
            links = soup.select(selector)
            for a_tag in links:
                href = a_tag.get("href")
                if href and href not in urls:
                    # Handle both absolute and relative URLs
                    if href.startswith('http'):
                        urls.append(href)
                    elif href.startswith('/'):
                        urls.append(f"https://www.startech.com.bd{href}")
                    else:
                        urls.append(f"https://www.startech.com.bd/{href}")
            
            # If we found products with one selector, we're likely good
            if urls:
                break
                
        return urls

    def extract_next_page_url(self, html: str) -> Optional[str]:
        """Extracts the URL of the next page from StarTech category page."""
        soup = self.parse_html(html)
        # Look for pagination "NEXT" link
        next_link = soup.find("a", string="NEXT")
        if next_link:
            return next_link.get("href")
        return None

    async def parse_product(self, html: str, url: str) -> Optional[ScrapedProduct]:
        """Parses a StarTech product page."""
        soup = self.parse_html(html)

        # 1. Product Name
        name_tag = soup.select_one("h1.product-name")
        if not name_tag:
            return None
        name = name_tag.text.strip()

        # 2. Price
        price = 0
        
        # Priority 1: Visual "Special Price" / "New Price"
        # StarTech uses <ins> for discounted price, or .price-new
        price_new = soup.select_one("ins") or soup.select_one(".price-new")
        if price_new:
            try:
                price = self.clean_price(price_new.text)
            except:
                pass

        # Priority 2: Meta Tag (Fallback if no special price)
        if price == 0:
            meta_price = soup.select_one("meta[property='product:price:amount']")
            if meta_price and meta_price.get("content"):
                try:
                    price = int(float(meta_price["content"]))
                except (ValueError, TypeError):
                    pass

        # Priority 2: Visual Elements (If meta fails or we want specific cash price)
        if price == 0:
            # Try finding cash price first
            cash_price_tag = soup.select_one(".p-wrap.cash .p-item-price")
            if cash_price_tag:
                price = self.clean_price(cash_price_tag.text)
            else:
                # Fallback to general price
                price_tag = soup.select_one(".price-wrap .price")
                if price_tag:
                    price = self.clean_price(price_tag.text)

        # 3. Status
        status_tag = soup.select_one(".product-status")
        status = status_tag.text.strip() if status_tag else "Unknown"

        # 4. Image
        image_url = None
        img_tag = soup.select_one(".product-images img")
        if img_tag:
            image_url = img_tag.get("src")

        # 5. Specifications
        specs = self._extract_specs(soup)

        return ScrapedProduct(
            name=name,
            vendor=self.VENDOR_NAME,
            price=price,
            url=url,
            image_url=image_url,
            status=status,
            specs=specs,
            raw_data={"html": html} 
        )

    def _extract_specs(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extracts specifications from the data table."""
        specs = {}
        # Find the specification table
        # StarTech uses id="specification" or class="data-table"
        table = soup.select_one("#specification table") or soup.select_one(".data-table")
        
        if not table:
            return specs

        for row in table.select("tr"):
            name_cell = row.select_one("td.name")
            value_cell = row.select_one("td.value")
            
            if name_cell and value_cell:
                key = name_cell.text.strip()
                value = value_cell.text.strip()
                specs[key] = value
        
        return specs
