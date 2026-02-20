from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from pydantic import BaseModel
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

# Pagination metadata
class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# Paginated response
class PaginatedComponentResponse(BaseModel):
    items: List[ComponentReadWithPrices]
    meta: PaginationMeta

router = APIRouter()

@router.get("/", response_model=PaginatedComponentResponse)
async def read_components(
    page: int = 1,
    page_size: int = 50,
    search: Optional[str] = None,
    category: Optional[ComponentType] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    brand: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    Retrieve components with pagination. Only shows components with at least one in-stock vendor price.
    """
    # Calculate offset from page number
    skip = (page - 1) * page_size
    
    # Base query for components with in-stock prices
    base_query = select(Component).options(selectinload(Component.prices))
    base_query = base_query.join(Component.prices).where(VendorPrice.in_stock == True)

    # Apply Filters
    if category:
        base_query = base_query.where(Component.component_type == category)
    
    if brand:
        base_query = base_query.where(Component.brand == brand)

    if search:
        base_query = base_query.where(Component.name.ilike(f"%{search}%"))

    # Price filtering on in-stock items
    if min_price is not None:
        base_query = base_query.where(VendorPrice.price_bdt >= min_price)
    if max_price is not None:
        base_query = base_query.where(VendorPrice.price_bdt <= max_price)
    
    # Make query distinct
    base_query = base_query.distinct()
    
    # Get total count for pagination
    count_query = select(func.count()).select_from(
        base_query.subquery()
    )
    total = session.exec(count_query).one()
    
    # Get paginated results
    components_query = base_query.offset(skip).limit(page_size)
    components = session.exec(components_query).all()
    
    # Calculate pagination metadata
    total_pages = (total + page_size - 1) // page_size
    has_next = page < total_pages
    has_prev = page > 1
    
    meta = PaginationMeta(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )
    
    return PaginatedComponentResponse(items=components, meta=meta)

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
