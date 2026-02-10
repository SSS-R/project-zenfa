import asyncio
import sys
import os
from sqlmodel import Session, create_engine, select
from app.models.component import Component
from app.models.cpu import CPU
from app.models.ram import RAM
from app.models.price import VendorPrice, VendorName
from app.models.enums import ComponentType, SocketType, RAMType
from app.scraping.vendors.startech import StarTechScraper
from app.scraping.vendors.skyland import SkylandScraper
from app.services.normalization import NormalizationService
from app.database import engine

# Ensure we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__)))

async def seed_and_scrape():
    print("--- Starting Demo Data Seed ---")
    
    # Initialize Service
    norm_service = NormalizationService()
    
    # Initialize Scrapers
    startech = StarTechScraper(headless=True)
    skyland = SkylandScraper(headless=True)
    
    with Session(engine) as session:
        # 1. Create Base Components (if not exist)
        print("1. Seeding Base Components...")
        
        # CPU: Ryzen 5 5600G
        cpu_slug = "amd-ryzen-5-5600g"
        cpu_comp = session.exec(select(Component).where(Component.slug == cpu_slug)).first()
        if not cpu_comp:
            cpu_comp = Component(name="AMD Ryzen 5 5600G", slug=cpu_slug, component_type=ComponentType.CPU, brand="AMD", image_url="https://www.startech.com.bd/image/cache/catalog/processor/amd/ryzen-5-5600g/ryzen-5-5600g-001-500x500.jpg")
            session.add(cpu_comp)
            session.commit()
            session.refresh(cpu_comp)
            
            # Add CPU details
            cpu_detail = CPU(component_id=cpu_comp.id, socket=SocketType.AM4, core_count=6, thread_count=12, base_clock_ghz=3.9, boost_clock_ghz=4.4, tdp=65, integrated_graphics=True, igpu_name="Radeon Graphics")
            session.add(cpu_detail)
            session.commit()
            print(f"   Created CPU: {cpu_comp.name}")
        else:
            print(f"   CPU {cpu_comp.name} already exists.")

        # RAM: Corsair Vengeance LPX 8GB DDR4 3200MHz
        ram_slug = "corsair-vengeance-lpx-8gb-ddr4-3200mhz"
        ram_comp = session.exec(select(Component).where(Component.slug == ram_slug)).first()
        if not ram_comp:
            ram_comp = Component(name="Corsair Vengeance LPX 8GB DDR4 3200MHz", slug=ram_slug, component_type=ComponentType.RAM, brand="Corsair")
            session.add(ram_comp)
            session.commit()
            session.refresh(ram_comp)
            
            # Add RAM details
            ram_detail = RAM(component_id=ram_comp.id, capacity_gb=8, speed_mhz=3200, ram_type=RAMType.DDR4, modules=1, latency_cl=16, voltage=1.35, color="Black")
            session.add(ram_detail)
            session.commit()
            print(f"   Created RAM: {ram_comp.name}")
        else:
            print(f"   RAM {ram_comp.name} already exists.")

        # 2. Scrape & Normalize
        print("\n2. Scraping & Normalizing Live Data...")
        
        targets = [
            # Tuple: (Url, Vendor, ScraperInstance, ComponentType)
            ("https://www.startech.com.bd/amd-ryzen-5-5600g-processor", VendorName.STARTECH, startech, ComponentType.CPU),
            ("https://www.skyland.com.bd/amd-ryzen-5-5600g-processor", VendorName.SKYLAND, skyland, ComponentType.CPU),
            ("https://www.startech.com.bd/corsair-vengeance-lpx-8gb-3200mhz-ddr4-desktop-ram", VendorName.STARTECH, startech, ComponentType.RAM),
            # Skyland RAM URL might need verification, likely different
            # For demo, let's try searching or just user StarTech for RAM if we don't have a known Skyland URL
        ]

        for url, vendor_enum, scraper, c_type in targets:
            print(f"   Fetching {url}...")
            scraped_data = await scraper.parse_product(await scraper.fetch_page(url), url)
            
            if scraped_data:
                print(f"     Found: {scraped_data.name} | Price: {scraped_data.price}")
                
                # Normalize
                matched_id = norm_service.normalize_product(session, scraped_data, c_type)
                
                if matched_id:
                    matched_comp = session.get(Component, matched_id)
                    print(f"     Mathed to DB ID: {matched_id} ({matched_comp.name})")
                    
                    # Update VendorPrice
                    # Check if exists
                    vp = session.exec(select(VendorPrice).where(VendorPrice.component_id == matched_id, VendorPrice.vendor_name == vendor_enum)).first()
                    if not vp:
                        vp = VendorPrice(component_id=matched_id, vendor_name=vendor_enum, price_bdt=scraped_data.price, url=url, in_stock=(scraped_data.status == "In Stock"))
                        session.add(vp)
                        print("     Created new price entry.")
                    else:
                        vp.price_bdt = scraped_data.price
                        vp.in_stock = (scraped_data.status == "In Stock")
                        vp.url = url # Update URL if changed
                        session.add(vp)
                        print("     Updated existing price entry.")
                    
                    session.commit()
                else:
                    print("     FAILED to match to any DB item.")
            else:
                print("     Failed to parse data.")

    print("\n--- Demo Data Validated & Saved ---")

if __name__ == "__main__":
    asyncio.run(seed_and_scrape())
