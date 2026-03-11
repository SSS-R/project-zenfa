import os
from sqlalchemy import create_engine, text
from sqlmodel import Session, select
from app.models.component import Component
from app.models.price import VendorPrice

# Use the exact DB URL
DB_URL = "postgresql://zenfa_admin:zenfa_secure_password_2026@192.168.0.231:5432/zenfa_db"
engine = create_engine(DB_URL)

try:
    with Session(engine) as session:
        # 1. Count total unique components vs total vendor prices
        comp_count = session.exec(select(Component)).all()
        price_count = session.exec(select(VendorPrice)).all()
        
        print("=== DATABASE OVERVIEW ===")
        print(f"Total Unique Components (shown on frontend): {len(comp_count)}")
        print(f"Total Vendor Prices scraped: {len(price_count)}")
        
        # 2. Find the mismatched ALTA 9 cooler
        print("\n=== FINDING MISMATCHED COOLER ===")
        mismatched_price = session.exec(
            select(VendorPrice)
            .where(VendorPrice.price_bdt == 550)
            .where(VendorPrice.vendor_name == 'StarTech')
        ).first()
        
        if mismatched_price:
            comp = session.get(Component, mismatched_price.component_id)
            print(f"Price Record ID: {mismatched_price.id}")
            print(f"URL Scraped: {mismatched_price.url}")
            print(f"Price: {mismatched_price.price_bdt}")
            print(f"Raw scraped data (name): {mismatched_price.raw_data.get('name') if mismatched_price.raw_data else 'None'}")
            print("\nLinked to Component:")
            print(f"Component ID: {comp.id}")
            print(f"Component Name: {comp.name}")
            print(f"Component Type: {comp.component_type}")
        else:
            print("Could not find a StarTech VendorPrice of 550 BDT.")
            
except Exception as e:
    print(f"Error: {e}")
