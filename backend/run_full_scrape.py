
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
    """Process multiple products with intelligent concurrency and rate limiting"""
    semaphore = asyncio.Semaphore(3)  # Reduced to 3 concurrent requests for better stealth
    batch_size = 15  # Smaller batches for better memory management
    success_count = 0
    
    async def process_single_product(p_url):
        async with semaphore:
            try:
                # Dynamic delay based on success rate and time
                base_delay = 1.5 if success_count < len(product_urls) * 0.1 else 2.5
                await asyncio.sleep(random.uniform(base_delay, base_delay * 1.8))
                
                logger.info(f"Processing: {p_url}")
                p_html = await scraper.fetch_page(p_url, retries=1)
                if not p_html:
                    return None
                    
                scraped_data = await scraper.parse_product(p_html, p_url)
                if scraped_data:
                    nonlocal success_count
                    success_count += 1
                    logger.info(f"Scraped: {scraped_data.name} | Price: {scraped_data.price}")
                return scraped_data, p_url
            except Exception as e:
                logger.error(f"Error processing {p_url}: {e}")
                # Add extra delay if errors start occurring
                await asyncio.sleep(random.uniform(3, 6))
                return None
    
    # Process products in smaller batches with adaptive timing
    scraped_results = []
    total_products = len(product_urls)
    
    for i in range(0, total_products, batch_size):
        batch_urls = product_urls[i:i + batch_size]
        logger.info(f"Processing batch {i//batch_size + 1}/{(total_products-1)//batch_size + 1} ({len(batch_urls)} products)")
        
        # Process batch concurrently with intelligent error handling
        tasks = [process_single_product(url) for url in batch_urls]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect successful results and monitor error rate
        error_count = 0
        for result in batch_results:
            if isinstance(result, Exception):
                error_count += 1
                logger.warning(f"Batch processing exception: {result}")
            elif result and result[0]:
                scraped_results.append(result)
        
        # Adaptive batch delay based on error rate
        if error_count > len(batch_urls) * 0.3:  # If >30% errors
            logger.warning(f"High error rate ({error_count}/{len(batch_urls)}), increasing delays")
            await asyncio.sleep(random.uniform(8, 15))
        else:
            # Normal inter-batch delay
            await asyncio.sleep(random.uniform(3, 6))
        
        # Memory cleanup after each batch
        if i % (batch_size * 2) == 0:
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
    """Enhanced category processing with stealth crawling"""
    url = vendor_urls.get(component_type)
    if not url:
        return 0
    
    logger.info(f"🔄 Scraping {scraper.VENDOR_NAME} {component_type} from {url}")
    
    # Collect all product URLs from first 5 pages (reduced for stealth)
    all_product_urls = []
    current_url = url
    max_pages = 5  # Further reduced for better stealth
    
    for page_count in range(1, max_pages + 1):
        logger.info(f"📄 Fetching Page {page_count}/{max_pages}: {current_url}")
        
        # Longer delay between category pages for stealth
        if page_count > 1:
            await asyncio.sleep(random.uniform(4, 8))
        
        html = await scraper.fetch_page(current_url)
        if not html:
            logger.error(f"❌ Failed to fetch page: {current_url}")
            # More conservative retry logic
            if page_count == 1:  # If first page fails, abort category
                break
            else:
                continue
    
        product_urls = scraper.extract_product_urls(html)
        logger.info(f"✅ Found {len(product_urls)} products on page {page_count}")
        
        # Remove duplicates while preserving order
        new_urls = [url for url in product_urls if url not in all_product_urls]
        all_product_urls.extend(new_urls)
        
        # Get next page URL
        next_url = scraper.extract_next_page_url(html)
        if not next_url:
            logger.info("📋 No more pages available")
            break
        
        current_url = next_url
    
    total_products = len(all_product_urls)
    logger.info(f"🎯 Total unique products to process: {total_products}")
    
    if total_products == 0:
        return 0
    
    # Randomize product order to avoid predictable patterns
    random.shuffle(all_product_urls)
    
    # Process all products concurrently with enhanced stealth
    saved_count = await process_products_concurrently(
        scraper, all_product_urls, component_type, normalization, session
    )
    
    logger.info(f"✅ {scraper.VENDOR_NAME} {component_type} completed: {saved_count}/{total_products} products saved")
    return saved_count

async def main():
    """Enhanced main scraping function with session management"""
    start_time = datetime.utcnow()
    logger.info("🚀 Starting enhanced stealth scraping process...")
    
    session = Session(engine)
    norm = NormalizationService()
    
    # Initialize scrapers with enhanced configuration
    startech = StarTechScraper(headless=True)
    skyland = SkylandScraper(headless=True)
    
    # Process ALL component types with optimized sequencing
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
    
    try:
        for c_type in targets:
            logger.info(f"\n{'='*50}")
            logger.info(f"🎯 Processing {c_type.value.upper()}")
            logger.info(f"{'='*50}")
            
            try:
                # Process StarTech with session management
                startech_saved = await process_vendor_category(startech, STARTECH_URLS, c_type, norm, session)
                total_saved += startech_saved
                
                # Strategic delay between vendors (longer for stealth)
                await asyncio.sleep(random.uniform(8, 15))
                
                # Process Skyland
                skyland_saved = await process_vendor_category(skyland, SKYLAND_URLS, c_type, norm, session)
                total_saved += skyland_saved
                
                # Longer inter-category delay for stealth
                if c_type != targets[-1]:  # Don't wait after last category
                    await asyncio.sleep(random.uniform(10, 20))
                
                # Memory cleanup after each component type
                gc.collect()
                
            except Exception as e:
                logger.error(f"❌ Error processing {c_type}: {e}")
                # Continue with other categories even if one fails
                continue
        
    finally:
        # Cleanup browser resources
        try:
            await startech.cleanup()
            await skyland.cleanup()
        except Exception as e:
            logger.warning(f"Cleanup warning: {e}")
    
    # Summary
    end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds()
    
    logger.info(f"\n{'='*50}")
    logger.info(f"✅ ENHANCED SCRAPING COMPLETED")
    logger.info(f"🕒 Duration: {duration:.0f} seconds ({duration/60:.1f} minutes)")
    logger.info(f"📊 Total products saved: {total_saved}")
    logger.info(f"⚡ Average speed: {total_saved/(duration/60):.1f} products/minute")
    logger.info(f"🛡️ Enhanced anti-detection measures active")
    logger.info(f"{'='*50}")
    
    session.close()

if __name__ == "__main__":
    asyncio.run(main())
