from sqlmodel import Session, select, create_engine
from app.models.price import VendorPrice
from app.models.component import Component
# Define Engine manually to ensuring connection string is explicit
# Using the same string that worked for Uvicorn
DATABASE_URL = "postgresql://postgres:zenfa_password@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)

with Session(engine) as session:
    prices = session.exec(select(VendorPrice)).all()
    components = session.exec(select(Component)).all()
    print(f"Components found: {len(components)}")
    for c in components:
        print(f" - {c.name} (ID: {c.id})")
        
    print(f"Vendor Prices found: {len(prices)}")
    for p in prices:
        print(f" - ID: {p.id} | ComponentID: {p.component_id} | Vendor: {p.vendor_name} | Price: {p.price_bdt}")
