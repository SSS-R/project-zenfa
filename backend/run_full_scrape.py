
import asyncio
import logging
import random
import gc
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor
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

# Category Mappings - All Components
STARTECH_URLS = {
    ComponentType.CPU: "https://www.startech.com.bd/component/processor",
    ComponentType.GPU: "https://www.startech.com.bd/component/graphics-card", 
    ComponentType.RAM: "https://www.startech.com.bd/component/ram",
    ComponentType.MOTHERBOARD: "https://www.startech.com.bd/component/motherboard",
    ComponentType.STORAGE: "https://www.startech.com.bd/component/ssd",
    ComponentType.PSU: "https://www.startech.com.bd/component/power-supply",
    ComponentType.CASE: "https://www.startech.com.bd/component/casing-pc-case",
    ComponentType.COOLER: "https://www.startech.com.bd/component/cpu-cooler",
}

SKYLAND_URLS = {
    ComponentType.CPU: "https://www.skyland.com.bd/processor",
    ComponentType.GPU: "https://www.skyland.com.bd/graphics-card",
    ComponentType.RAM: "https://www.skyland.com.bd/desktop-ram", 
    ComponentType.MOTHERBOARD: "https://www.skyland.com.bd/motherboard",
    ComponentType.STORAGE: "https://www.skyland.com.bd/ssd",
    ComponentType.PSU: "https://www.skyland.com.bd/power-supply", 
    ComponentType.CASE: "https://www.skyland.com.bd/computer-casing",
    ComponentType.COOLER: "https://www.skyland.com.bd/cpu-cooler",
}

async def process_products_concurrently(scraper, product_urls, component_type, normalization, session):
    """Process multiple products concurrently with controlled concurrency"""
    semaphore = asyncio.Semaphore(5)  # Limit to 5 concurrent requests
    batch_size = 20
    
    async def process_single_product(p_url):
        async with semaphore:
            try:
                # Reduced delay for concurrent processing
                await asyncio.sleep(random.uniform(0.5, 1.5))
                
                logger.info(f"Processing: {p_url}")
                p_html = await scraper.fetch_page(p_url)
                if not p_html:
                    return None
                    
                scraped_data = await scraper.parse_product(p_html, p_url)
                if scraped_data:
                    logger.info(f"Scraped: {scraped_data.name} | Price: {scraped_data.price}")
                return scraped_data, p_url
            except Exception as e:
                logger.error(f"Error processing {p_url}: {e}")
                return None
    
    # Process products in batches to manage memory
    scraped_results = []
    total_products = len(product_urls)
    
    for i in range(0, total_products, batch_size):
        batch_urls = product_urls[i:i + batch_size]
        logger.info(f"Processing batch {i//batch_size + 1}/{(total_products-1)//batch_size + 1} ({len(batch_urls)} products)")
        
        # Process batch concurrently
        tasks = [process_single_product(url) for url in batch_urls]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect successful results
        for result in batch_results:
            if result and not isinstance(result, Exception) and result[0]:
                scraped_results.append(result)
        
        # Memory cleanup after each batch
        if i % (batch_size * 3) == 0:
            gc.collect()
    
    # Batch save to database
    await batch_save_products(scraped_results, scraper, component_type, normalization, session)
    return len(scraped_results)

async def batch_save_products(scraped_results, scraper, component_type, normalization, session):
    """Save multiple products in batches for better database performance"""
    batch_size = 25
    total_saved = 0
    
    for i in range(0, len(scraped_results), batch_size):
        batch = scraped_results[i:i + batch_size]
        
        try:
            for scraped_data, p_url in batch:
                match_id = normalization.normalize_product(session, scraped_data, component_type)
                
                if match_id:
                    # Update existing price
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
                        existing_price.url = scraped_data.url
                        existing_price.raw_data = scraped_data.raw_data
                    else:
                        new_price = VendorPrice(
                            component_id=match_id,
                            vendor_name=scraper.VENDOR_NAME,
                            price_bdt=scraped_data.price,
                            url=scraped_data.url,
                            in_stock=(scraped_data.status.lower() == "in stock"),
                            raw_data=scraped_data.raw_data,
                            last_updated=datetime.utcnow()
                        )
                        session.add(new_price)
                    total_saved += 1
                else:
                    # Create new component logic (simplified for batch processing)
                    if scraper.VENDOR_NAME == "StarTech":
                        await create_new_component(scraped_data, scraper, component_type, session)
                        total_saved += 1
            
            # Commit entire batch at once
            session.commit()
            logger.info(f"Batch saved: {len(batch)} products")
            
        except Exception as e:
            logger.error(f"Batch save failed: {e}")
            session.rollback()
    
    logger.info(f"Total products saved: {total_saved}")

async def create_new_component(scraped_data, scraper, component_type, session):
    """Create new component efficiently"""
    try:
        import re
        slug = scraped_data.name.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = slug.strip('-')
        
        # Check if slug exists
        existing_slug = session.exec(select(Component).where(Component.slug == slug)).first()
        if existing_slug:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

        # Extract brand
        brand = scraped_data.name.split(" ")[0]
        for k, v in scraped_data.specs.items():
            if "brand" in k.lower():
                brand = v
                break

        # Create component
        new_component = Component(
            name=scraped_data.name,
            slug=slug,
            image_url=scraped_data.image_url,
            component_type=component_type,
            brand=brand,
            performance_score=50
        )
        session.add(new_component)
        session.commit()
        session.refresh(new_component)
        
        # Create price
        new_price = VendorPrice(
            component_id=new_component.id,
            vendor_name=scraper.VENDOR_NAME,
            price_bdt=scraped_data.price,
            url=scraped_data.url,
            in_stock=(scraped_data.status.lower() == "in stock"),
            raw_data=scraped_data.raw_data,
            last_updated=datetime.utcnow()
        )
        session.add(new_price)
        session.commit()
        logger.info(f"Created new component: {new_component.name} (ID: {new_component.id})")
        
    except Exception as e:
        logger.error(f"Failed to create component: {e}")
        session.rollback()

async def process_vendor_category(
    scraper, 
    vendor_urls: Dict[ComponentType, str], 
    component_type: ComponentType, 
    normalization: NormalizationService,
    session: Session
):
    """Optimized category processing with concurrent execution"""
    url = vendor_urls.get(component_type)
    if not url:
        return 0
    
    logger.info(f"🔄 Scraping {scraper.VENDOR_NAME} {component_type} from {url}")
    
    # Collect all product URLs from first 7 pages
    all_product_urls = []
    current_url = url
    max_pages = 7  # Reduced from 20 to 7
    
    for page_count in range(1, max_pages + 1):
        logger.info(f"📄 Fetching Page {page_count}/{max_pages}: {current_url}")
        
        html = await scraper.fetch_page(current_url)
        if not html:
            logger.error(f"❌ Failed to fetch page: {current_url}")
            break
    
        product_urls = scraper.extract_product_urls(html)
        logger.info(f"✅ Found {len(product_urls)} products on page {page_count}")
        
        all_product_urls.extend(product_urls)
        
        # Get next page URL
        current_url = scraper.extract_next_page_url(html)
        if not current_url:
            logger.info("📋 No more pages available")
            break
        
        # Small delay between page requests
        await asyncio.sleep(random.uniform(1, 2))
    
    total_products = len(all_product_urls)
    logger.info(f"🎯 Total products to process: {total_products}")
    
    if total_products == 0:
        return 0
    
    # Process all products concurrently
    saved_count = await process_products_concurrently(
        scraper, all_product_urls, component_type, normalization, session
    )
    
    logger.info(f"✅ {scraper.VENDOR_NAME} {component_type} completed: {saved_count}/{total_products} products saved")
    return saved_count

async def main():
    """Optimized main scraping function"""
    start_time = datetime.utcnow()
    logger.info("🚀 Starting optimized scraping process...")
    
    session = Session(engine)
    norm = NormalizationService()
    
    # Initialize scrapers
    startech = StarTechScraper(headless=True)
    skyland = SkylandScraper(headless=True)
    
    # Process ALL component types (matching frontend categories)
    targets = [
        ComponentType.CPU,
        ComponentType.GPU,
        ComponentType.MOTHERBOARD,
        ComponentType.RAM,
        ComponentType.STORAGE,
        ComponentType.PSU,
        ComponentType.CASE,
        ComponentType.COOLER
    ]
    
    total_saved = 0
    
    for c_type in targets:
        logger.info(f"\n{'='*50}")
        logger.info(f"🎯 Processing {c_type.value.upper()}")
        logger.info(f"{'='*50}")
        
        try:
            # Process StarTech
            startech_saved = await process_vendor_category(startech, STARTECH_URLS, c_type, norm, session)
            total_saved += startech_saved
            
            # Small delay between vendors
            await asyncio.sleep(2)
            
            # Process Skyland
            skyland_saved = await process_vendor_category(skyland, SKYLAND_URLS, c_type, norm, session)
            total_saved += skyland_saved
            
            # Memory cleanup after each component type
            gc.collect()
            
        except Exception as e:
            logger.error(f"❌ Error processing {c_type}: {e}")
            continue
    
    # Summary
    end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds()
    
    logger.info(f"\n{'='*50}")
    logger.info(f"✅ SCRAPING COMPLETED")
    logger.info(f"🕒 Duration: {duration:.0f} seconds ({duration/60:.1f} minutes)")
    logger.info(f"📊 Total products saved: {total_saved}")
    logger.info(f"⚡ Average speed: {total_saved/(duration/60):.1f} products/minute")
    logger.info(f"{'='*50}")
    
    session.close()

if __name__ == "__main__":
    asyncio.run(main())
