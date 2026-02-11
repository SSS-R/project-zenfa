from bs4 import BeautifulSoup
from typing import Optional, Dict
import re
from urllib.parse import urljoin
from ..base_scraper import BaseScraper
from ..schemas import ScrapedProduct

class SkylandScraper(BaseScraper):
    """Scraper for Skyland Computer BD website."""

    VENDOR_NAME = "Skyland"

    def extract_product_urls(self, html: str) -> list[str]:
        """Extracts product URLs from Skyland category page."""
        soup = self.parse_html(html)
        urls = []
        
        # Skyland uses .product-thumb .caption a (or h4 a)
        # Try multiple selectors
        selectors = [
            ".product-thumb .caption h4 a",
            ".product-thumb .name a",
            ".product-layout .caption h4 a"
        ]
        
        for selector in selectors:
            links = soup.select(selector)
            if links:
                for a_tag in links:
                    href = a_tag.get("href")
                    if href and href not in urls:
                        urls.append(href)
                # If we found links with one selector, likely we're good
                if urls:
                    break
                    
        return urls

    async def parse_product(self, html: str, url: str) -> Optional[ScrapedProduct]:
        """Parses a Skyland product page."""
        soup = self.parse_html(html)

        # 1. Product Name (Global)
        name_tag = soup.select_one("h1")
        if not name_tag:
            return None
        name = name_tag.text.strip()

        # 2. Price
        price = 0
        
        # Priority 0: Meta Tag (Most reliable)
        meta_price = soup.select_one("meta[property='product:price:amount']") or soup.select_one("meta[itemprop='price']")
        if meta_price and meta_price.get("content"):
            try:
                price = int(float(meta_price["content"]))
            except (ValueError, TypeError):
                pass
        
        if price == 0:
            # Strategy: Find price that appears AFTER the product name (h1)
            # This avoids header cart totals/promos
            
            # Priority 1: Special/New Price
            price_new_tag = name_tag.find_next(class_="price-new")
            if price_new_tag:
                 price = self.clean_price(price_new_tag.text)
            
            # Priority 2: Standard/Product Price
            if price == 0:
                product_price_tag = name_tag.find_next(class_="product-price")
                if product_price_tag:
                     price = self.clean_price(product_price_tag.text)

            # Priority 3: Fallback generic price
            if price == 0:
                 price_tag = name_tag.find_next(class_="price")
                 if price_tag:
                      price = self.clean_price(price_tag.text)

        # 3. Status
        status = "Unknown"
        stock_tag = soup.select_one(".stock") or soup.select_one(".product-stock")
        if stock_tag:
            status = stock_tag.text.strip()
        else:
            # Check for 'In Stock' text anywhere in product info
            # Limit scope to ensure we don't pick up footer/header
            container = soup.select_one(".product-info") or soup.select_one("#content") or soup
            if "In Stock" in container.text:
                status = "In Stock"
            elif "Out of Stock" in container.text:
                status = "Out of Stock"
            # Final fallback: check whole page if not found in container
            elif "In Stock" in soup.text:
                status = "In Stock"
        
        # 4. Image
        image_url = None
        # Try og:image first
        og_image = soup.select_one("meta[property='og:image']")
        if og_image and og_image.get("content"):
            image_url = og_image["content"]
        else:
            img_tag = soup.select_one(".main-image img") or soup.select_one(".product-image img")
            if img_tag:
                src = img_tag.get("src")
                image_url = urljoin(url, src)

        # 5. Specifications
        specs = self._extract_specs(soup)

        return ScrapedProduct(
            name=name,
            vendor=self.VENDOR_NAME,
            price=price,
            url=url,
            image_url=image_url,
            status=status,
            specs=specs
        )

    def _extract_specs(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extracts specifications from the data table."""
        specs = {}
        # Skyland uses .product-spec-table or table.attribute
        table = soup.select_one(".product-spec-table") or soup.select_one(".attribute") or soup.select_one("table.table-bordered")
        
        if not table:
            # Try finding any table with 'Specification' in preceding header
            for h in soup.select("h3, h4"):
                if "Specification" in h.text:
                    table = h.find_next("table")
                    break
        
        if not table:
            return specs

        for row in table.select("tr"):
            cols = row.select("td")
            if len(cols) >= 2:
                key = cols[0].text.strip()
                value = cols[1].text.strip()
                if key and value:
                    specs[key] = value
        
        return specs
