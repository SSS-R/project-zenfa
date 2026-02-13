from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from sqlalchemy.orm import selectinload
from ...database import get_session
from ...database import get_session
from ...models.component import Component
from ...models.price import VendorPrice
from ...models.enums import ComponentType
from typing import Optional
from ...models.price import VendorPrice

# Create a Read model with prices included
class ComponentReadWithPrices(Component):
    prices: List[VendorPrice] = []
    
    class Config:
        table = False

router = APIRouter()

@router.get("/", response_model=List[ComponentReadWithPrices])
async def read_components(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[ComponentType] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    brand: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    Retrieve components with optional filtering.
    """
    query = select(Component).options(selectinload(Component.prices))

    # Apply Filters
    if category:
        query = query.where(Component.component_type == category)
    
    if brand:
        query = query.where(Component.brand == brand)

    if search:
        # Case-insensitive search on name
        query = query.where(Component.name.ilike(f"%{search}%"))

    # For price filtering, we need to join with VendorPrice
    # But filtering by "any price in range" on a relationship is tricky in a single query 
    # if we want to return the Component object with ALL prices.
    # A simple approach: Filter components where ANY price matches.
    if min_price is not None or max_price is not None:
        query = query.join(Component.prices)
        if min_price is not None:
             query = query.where(VendorPrice.price_bdt >= min_price)
        if max_price is not None:
             query = query.where(VendorPrice.price_bdt <= max_price)
        # Distinct to avoid duplicates if multiple prices match
        query = query.distinct()

    components = session.exec(
        query.offset(skip).limit(limit)
    ).all()
    
    return components

@router.get("/{component_id}", response_model=ComponentReadWithPrices)
async def read_component(
    component_id: int,
    session: Session = Depends(get_session)
):
    """
    Retrieve a specific component by ID with its prices.
    """
    component = session.exec(
        select(Component)
        .where(Component.id == component_id)
        .options(selectinload(Component.prices))
    ).first()
    
    if not component:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Component not found")
        
    return component
