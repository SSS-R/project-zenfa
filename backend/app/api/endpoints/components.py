from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from sqlalchemy.orm import selectinload
from ...database import get_session
from ...models.component import Component
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
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """
    Retrieve components with their prices.
    """
    # Use selectinload to fetch the related prices efficiently
    components = session.exec(
        select(Component)
        .options(selectinload(Component.prices))
        .offset(skip)
        .limit(limit)
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
