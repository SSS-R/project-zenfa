import asyncio
import json
from sqlmodel import Session, select, text
from app.database import engine
from app.models.component import Component
from app.models.price import VendorPrice
from app.scraping.schemas import ScrapedProduct
from app.services.normalization import NormalizationService
from datetime import datetime
import re

async def main():
    print("Initializing Database Rebuild...")
    session = Session(engine)
    
    # 1. Fetch all existing data into memory
    all_prices = session.exec(select(VendorPrice)).all()
    print(f"Found {len(all_prices)} vendor prices to process.")
    
    data_to_rebuild = []
    for vp in all_prices:
        if not vp.raw_data:
            print(f"Skipping {vp.id} because raw_data is missing!")
            continue
            
        comp = session.get(Component, vp.component_id)
        if not comp:
            continue
            
        data_to_rebuild.append({
            'raw': vp.raw_data,
            'component_type': comp.component_type,
            'vendor_name': vp.vendor_name,
            'url': vp.url,
            'in_stock': vp.in_stock,
            'last_updated': vp.last_updated
        })
        
    print(f"Successfully cached {len(data_to_rebuild)} items in memory.")
    
    # 2. Delete existing records
    print("Clearing corrupted database tables...")
    session.exec(text("TRUNCATE TABLE vendor_prices CASCADE"))
    session.exec(text("TRUNCATE TABLE components CASCADE"))
    session.commit()
    print("Database cleared.")
    
    # 3. Rebuild with new normalization rules
    norm = NormalizationService()
    total_saved = 0
    
    for item in data_to_rebuild:
        scraped_data = ScrapedProduct(**item['raw'])
        component_type = item['component_type']
        vendor_name = item['vendor_name']
        
        match_id = norm.normalize_product(session, scraped_data, component_type)
        
        try:
            if match_id:
                # Component exists, create/update Price
                new_price = VendorPrice(
                    component_id=match_id,
                    vendor_name=vendor_name,
                    price_bdt=scraped_data.price,
                    url=item['url'],
                    in_stock=item['in_stock'],
                    raw_data=scraped_data.raw_data,
                    last_updated=item['last_updated']
                )
                session.add(new_price)
                total_saved += 1
            else:
                # Create NEW Component
                slug = scraped_data.name.lower()
                slug = re.sub(r'[^a-z0-9]+', '-', slug)
                slug = slug.strip('-')
                
                existing_slug = session.exec(select(Component).where(Component.slug == slug)).first()
                if existing_slug:
                    slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
                    
                brand = scraped_data.name.split(" ")[0]
                for k, v in scraped_data.specs.items():
                    if "brand" in k.lower() and v:
                        brand = v
                        break
                        
                new_component = Component(
                    name=scraped_data.name,
                    slug=slug,
                    image_url=scraped_data.image_url,
                    component_type=component_type,
                    brand=brand,
                    performance_score=50
                )
                session.add(new_component)
                session.flush() # get ID
                
                new_price = VendorPrice(
                    component_id=new_component.id,
                    vendor_name=vendor_name,
                    price_bdt=scraped_data.price,
                    url=item['url'],
                    in_stock=item['in_stock'],
                    raw_data=scraped_data.raw_data,
                    last_updated=item['last_updated']
                )
                session.add(new_price)
                total_saved += 1
                
            # Commit every single item to allow matching on the next iteration!
            session.commit()
            
        except Exception as e:
            print(f"Error rebuilding {scraped_data.name}: {e}")
            session.rollback()
            
    print(f"Rebuild completed! Successfully inserted {total_saved} prices.")
    
    # Check new unique components
    new_comps = session.exec(select(Component)).all()
    print(f"New total unique components: {len(new_comps)}")

if __name__ == "__main__":
    asyncio.run(main())
