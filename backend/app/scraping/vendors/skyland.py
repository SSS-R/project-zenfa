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

    def extract_next_page_url(self, html: str) -> Optional[str]:
        """Extracts the URL of the next page from Skyland category page."""
        soup = self.parse_html(html)
        # Look for pagination "Next" link
        # Common in OpenCart specific themes: class="next" or text ">"
        next_link = soup.select_one("ul.pagination .next_link") or \
                    soup.select_one("ul.pagination .next") or \
                    soup.find("a", string=">") or \
                    soup.find("a", string="&gt;")
        
        if next_link:
            return next_link.get("href")
        return None

    async def parse_product(self, html: str, url: str) -> Optional[ScrapedProduct]:
        """Parses a Skyland product page."""
        soup = self.parse_html(html)

        # 1. Product Name (Global)
        name_tag = soup.select_one("h1")
        if name_tag:
            name = name_tag.text.strip()
        else:
            # Fallback to meta title or page title
            name = soup.select_one("meta[property='og:title']")
            if name:
                name = name.get("content")
            elif soup.title:
                name = soup.title.text.strip()
                # Remove "Price in BD" suffix if common
                name = name.replace(" Price in BD", "").replace(" | Skyland", "")
            else:
                return None
        
        # 2. Price
        price = 0
        
        # Priority 0: Try JSON-LD structured data first
        scripts = soup.select("script[type='application/ld+json']")
        for script in scripts:
            try:
                import json
                data = json.loads(script.text)
                if isinstance(data, dict) and "offers" in data:
                    offers = data["offers"]
                    if isinstance(offers, dict) and "price" in offers:
                        price = int(float(offers["price"]))
                        break
                    elif isinstance(offers, list) and offers and "price" in offers[0]:
                        price = int(float(offers[0]["price"]))
                        break
            except (json.JSONDecodeError, KeyError, ValueError, TypeError):
                continue
        
        # Priority 1: Meta Tag
        if price == 0:
            meta_price = soup.select_one("meta[property='product:price:amount']") or soup.select_one("meta[itemprop='price']")
            if meta_price and meta_price.get("content"):
                try:
                    price = int(float(meta_price["content"]))
                except (ValueError, TypeError):
                    pass
        
        if price == 0:
            # Priority 2: Direct price selectors (most reliable)
            price_selectors = [
                ".price-new",
                ".product-price", 
                ".our-price",
                "#product-price",
                ".current-price",
                ".sale-price"
            ]
            
            for selector in price_selectors:
                price_tag = soup.select_one(selector)
                if price_tag:
                    price_text = price_tag.text.strip()
                    # Extract first price if multiple prices (e.g., "49,500৳ 59,500৳")
                    import re
                    price_match = re.search(r'([\d,]+)৳', price_text)
                    if price_match:
                        price = self.clean_price(price_match.group(1))
                        if price > 0:
                            break
            
            # Priority 3: Generic price class (be more selective)
            if price == 0:
                product_block = soup.select_one("#content") or soup.select_one(".product-info") or soup
                price_list = product_block.select_one("ul.list-unstyled.price")
                if price_list:
                    price_item = price_list.select_one("li h2") or price_list.select_one("li")
                    if price_item:
                        price = self.clean_price(price_item.text)
            
            # Priority 4: Regex Search in Full Page
            if price == 0:
                import re
                # Look for price patterns in the entire HTML
                price_patterns = re.findall(r'([\d,]+)\s*৳', html)
                if price_patterns:
                    # Take the first price that's reasonable (> 100)
                    for pattern in price_patterns:
                        potential_price = self.clean_price(pattern)
                        if potential_price > 100:  # Filter out small numbers like "0৳"
                            price = potential_price
                            break

        # 3. Status
        status = "Unknown"
        
        # Priority 1: Check specific stock status elements
        stock_selectors = [
            ".out-of-stock",
            ".in-stock", 
            ".stock",
            ".product-stock",
            ".availability",
            ".stock-status"
        ]
        
        for selector in stock_selectors:
            stock_tag = soup.select_one(selector)
            if stock_tag:
                status_text = stock_tag.text.strip()
                # Clean up the status text - take only the first line or first few words
                status = status_text.split('\n')[0].strip()
                # If still too long, take first 20 characters
                if len(status) > 20:
                    status = status[:20].strip()
                break
        
        # Priority 2: Look for common status keywords
        if status == "Unknown":
            container = soup.select_one(".product-info") or soup.select_one("#content") or soup
            container_text = container.text.lower()
            
            if "in stock" in container_text:
                status = "In Stock"
            elif "out of stock" in container_text:
                status = "Out of Stock"
            elif "upcoming" in container_text:
                status = "Upcoming"
            elif "pre-order" in container_text:
                status = "Pre-Order"
            elif "discontinued" in container_text:
                status = "Discontinued"
        
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
            specs=specs,
            raw_data={"html": html} 
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
