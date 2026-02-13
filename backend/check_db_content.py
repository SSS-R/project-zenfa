
from sqlmodel import Session, select
from app.database import engine
from app.models.component import Component
from app.models.price import VendorPrice

def check_db():
    with Session(engine) as session:
        components = session.exec(select(Component)).all()
        print(f"Total Components: {len(components)}")
        
        for c in components:
            print(f"ID: {c.id} | Name: {c.name}")
            print(f"  - Image URL: {c.image_url}")
            print(f"  - Slug: {c.slug}")
            
            prices = session.exec(select(VendorPrice).where(VendorPrice.component_id == c.id)).all()
            for p in prices:
                print(f"    - Price: {p.vendor_name} : {p.price_bdt}")
            print("-" * 20)

if __name__ == "__main__":
    check_db()
