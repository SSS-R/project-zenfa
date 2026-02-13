
import asyncio
import logging
from typing import List, Dict
from sqlmodel import Session, select
from app.database import engine
from app.models.enums import ComponentType
from app.scraping.vendors.startech import StarTechScraper
from app.scraping.vendors.skyland import SkylandScraper
from app.services.normalization import NormalizationService
from app.models.price import VendorPrice
from datetime import datetime
from app.models.component import Component

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Category Mappings
STARTECH_URLS = {
    ComponentType.CPU: "https://www.startech.com.bd/component/processor",
    ComponentType.GPU: "https://www.startech.com.bd/component/graphics-card",
    ComponentType.RAM: "https://www.startech.com.bd/component/ram",
    ComponentType.MOTHERBOARD: "https://www.startech.com.bd/component/motherboard",
    ComponentType.STORAGE: "https://www.startech.com.bd/component/ssd", # Focusing on SSDs
    ComponentType.PSU: "https://www.startech.com.bd/component/power-supply",
    ComponentType.CASE: "https://www.startech.com.bd/component/casing-pc-case",
}

SKYLAND_URLS = {
    ComponentType.CPU: "https://www.skyland.com.bd/processor",
    ComponentType.GPU: "https://www.skyland.com.bd/graphics-card",
    ComponentType.RAM: "https://www.skyland.com.bd/desktop-ram",
    ComponentType.MOTHERBOARD: "https://www.skyland.com.bd/motherboard",
    ComponentType.STORAGE: "https://www.skyland.com.bd/ssd",
    ComponentType.PSU: "https://www.skyland.com.bd/power-supply",
    ComponentType.CASE: "https://www.skyland.com.bd/computer-casing",
}

async def process_vendor_category(
    scraper, 
    vendor_urls: Dict[ComponentType, str], 
    component_type: ComponentType, 
    normalization: NormalizationService,
    session: Session
):
    url = vendor_urls.get(component_type)
    if not url:
        return
    
    logger.info(f"--- Scraping {scraper.VENDOR_NAME} {component_type} from {url} ---")
    
    current_url = url
    page_count = 0
    max_pages = 20 # Safety limit for now
    
    while current_url and page_count < max_pages:
        page_count += 1
        logger.info(f"Fetching Page {page_count}: {current_url}")
        
        # 1. Get Category Page
        html = await scraper.fetch_page(current_url)
        if not html:
            logger.error(f"Failed to fetch category page: {current_url}")
            break
    
        # 2. Extract Product URLs
        product_urls = scraper.extract_product_urls(html)
        logger.info(f"Found {len(product_urls)} products on page {page_count}")
        
        import random
        # 3. Scrape Each Product
        for p_url in product_urls: # Process all products
            # Add random delay to be safe (2-5 seconds)
            delay = random.uniform(2, 5)
            logger.info(f"Sleeping for {delay:.2f}s...")
            await asyncio.sleep(delay)
            
            logger.info(f"Processing: {p_url}")
            try:
                p_html = await scraper.fetch_page(p_url)
                if not p_html:
                    continue
                    
                scraped_data = await scraper.parse_product(p_html, p_url)
                if not scraped_data:
                    logger.warning("Failed to parse product")
                    continue
                    
                logger.info(f"Scraped: {scraped_data.name} | Price: {scraped_data.price}")
                
                # 4. Normalize & Save
                # Note: This requires the Component to ALREADY EXIST in DB.
                # If we want to create new components, we need logic for that.
                # For Phase 2, we assume we are just matching prices to *existing* components (seeded from generic list).
                # But wait, seed_demo_data only seeded 2 components.
                # If we want to strictly 'finish' phase 2 as "Syncing Prices", we need more base components.
                # However, for now, let's just try to match.
                
                
                match_id = normalization.normalize_product(session, scraped_data, component_type)
                
                if match_id:
                    logger.info(f"MATCH! Linked to Component ID {match_id}")
                    
                    # Check if price exists
                    existing_price = session.exec(
                        select(VendorPrice).where(
                            VendorPrice.component_id == match_id,
                            VendorPrice.vendor_name == scraper.VENDOR_NAME
                        )
                    ).first()
                    
                    if existing_price:
                        existing_price.price_bdt = scraped_data.price
                        existing_price.last_updated = datetime.utcnow()
                        existing_price.in_stock = (scraped_data.status.lower() == "in stock")
                        existing_price.in_stock = (scraped_data.status.lower() == "in stock")
                        existing_price.url = scraped_data.url
                        existing_price.raw_data = scraped_data.raw_data
                    else:
                        new_price = VendorPrice(
                            component_id=match_id,
                            vendor_name=scraper.VENDOR_NAME,
                            price_bdt=scraped_data.price,
                            price_bdt=scraped_data.price,
                            url=scraped_data.url,
                            in_stock=(scraped_data.status.lower() == "in stock"),
                            raw_data=scraped_data.raw_data,
                            last_updated=datetime.utcnow()
                        )
                        session.add(new_price)
                    
                    session.commit()
                else:
                    logger.info("No match found in DB.")
                    # --- NEW: Seeding Logic for StarTech ---
                    if scraper.VENDOR_NAME == "StarTech":
                        logger.info(f"Creating new component from StarTech: {scraped_data.name}")
                        try:
                            # 1. Generate Slug
                            # Simple slug generation without external dependency
                            import re
                            slug = scraped_data.name.lower()
                            slug = re.sub(r'[^a-z0-9]+', '-', slug)
                            slug = slug.strip('-')
                            
                            # Check if slug exists (unlikely if fuzzy match failed, but good to check)
                            existing_slug = session.exec(select(Component).where(Component.slug == slug)).first()
                            if existing_slug:
                                slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    
                            # 2. Extract Brand (Simple heuristic: First word)
                            brand = scraped_data.name.split(" ")[0]
                            if "specifications" in scraped_data.specs: # Check if we have brand in specs
                                 # Iterate specs to find Brand
                                 for k, v in scraped_data.specs.items():
                                     if "brand" in k.lower():
                                         brand = v
                                         break
    
                            # 3. Create Component
                            new_component = Component(
                                name=scraped_data.name,
                                slug=slug,
                                image_url=scraped_data.image_url,
                                component_type=component_type,
                                brand=brand,
                                performance_score=50 # Default
                            )
                            session.add(new_component)
                            session.commit()
                            session.refresh(new_component)
                            
                            # 4. Create Price
                            new_price = VendorPrice(
                                component_id=new_component.id,
                                vendor_name=scraper.VENDOR_NAME,
                                price_bdt=scraped_data.price,
                                vendor_name=scraper.VENDOR_NAME,
                                price_bdt=scraped_data.price,
                                url=scraped_data.url,
                                in_stock=(scraped_data.status.lower() == "in stock"),
                                raw_data=scraped_data.raw_data,
                                last_updated=datetime.utcnow()
                            )
                            session.add(new_price)
                            session.commit()
                            logger.info(f"Created New Component: {new_component.name} (ID: {new_component.id})")
                            
                        except Exception as e:
                            logger.error(f"Failed to create component: {e}")
                            session.rollback()
                    
            except Exception as e:
                logger.error(f"Error processing {p_url}: {e}")
        
        # Check for next page
        current_url = scraper.extract_next_page_url(html)
        if current_url:
            logger.info(f"Next page found: {current_url}")
        else:
            logger.info("No more pages.")

async def main():
    session = Session(engine)
    norm = NormalizationService()
    
    startech = StarTechScraper(headless=True)
    skyland = SkylandScraper(headless=True)
    
    # Run for CPU and GPU first
    targets = [ComponentType.CPU, ComponentType.GPU]
    
    for c_type in targets:
        await process_vendor_category(startech, STARTECH_URLS, c_type, norm, session)
        await process_vendor_category(skyland, SKYLAND_URLS, c_type, norm, session)

    session.close()

if __name__ == "__main__":
    asyncio.run(main())
