from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID

from ...database import get_session
from ...models.user import User
from ...models.transaction import Transaction, TransactionStatusEnum
from ..deps import get_current_admin_user
from ..schemas import TransactionResponse
from pydantic import BaseModel

class TransactionUpdateStatus(BaseModel):
    status: str

router = APIRouter(dependencies=[Depends(get_current_admin_user)])

@router.get("/", response_model=List[TransactionResponse])
def list_transactions(
    status: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_session)
):
    """List transactions. Optionally filter by status."""
    statement = select(Transaction)
    if status is not None:
        try:
            status_enum = TransactionStatusEnum(status.lower())
            statement = statement.where(Transaction.status == status_enum)
        except ValueError:
            pass # ignore invalid status filter
            
    statement = statement.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)
    return db.exec(statement).all()

@router.patch("/{transaction_id}/status", response_model=TransactionResponse)
def update_transaction_status(
    transaction_id: UUID, 
    req: TransactionUpdateStatus, 
    db: Session = Depends(get_session)
):
    """Update a transaction status (e.g., approve manual payment)."""
    tx = db.get(Transaction, transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    try:
        new_status = TransactionStatusEnum(req.status.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    # Prevent double-crediting
    if tx.status != TransactionStatusEnum.SUCCESS and new_status == TransactionStatusEnum.SUCCESS:
        # Credit the user
        user = db.get(User, tx.user_id)
        if user:
            user.token_balance += tx.tokens_granted
            db.add(user)
    
    # Handle refunding/revoking tokens if needed (simplified)
    elif tx.status == TransactionStatusEnum.SUCCESS and new_status in [TransactionStatusEnum.REFUNDED, TransactionStatusEnum.FAILED]:
        user = db.get(User, tx.user_id)
        if user:
            # We don't want them to go into negative tokens blindly, but for MVP it's fine
            user.token_balance = max(0, user.token_balance - tx.tokens_granted)
            db.add(user)

    tx.status = new_status
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
