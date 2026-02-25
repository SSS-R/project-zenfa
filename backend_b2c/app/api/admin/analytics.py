from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Dict, Any
from sqlalchemy import func

from ...database import get_session
from ...models.user import User
from ...models.transaction import Transaction, TransactionStatusEnum
from ...models.support import SupportTicket, TicketStatusEnum
from ..deps import get_current_admin_user

router = APIRouter(dependencies=[Depends(get_current_admin_user)])

@router.get("/", response_model=Dict[str, Any])
def get_analytics_dashboard(db: Session = Depends(get_session)):
    """Get high-level statistics for the admin dashboard."""
    # 1. Total users
    total_users = db.exec(select(func.count(User.id))).one()
    
    # 2. Total revenue (successful transactions)
    # Using SQLModel's select with func.sum
    revenue_stmt = select(func.sum(Transaction.amount_bdt)).where(Transaction.status == TransactionStatusEnum.SUCCESS)
    total_revenue = db.exec(revenue_stmt).one() or 0.0
    
    # 3. Pending manual transactions (needs approval)
    pending_tx_stmt = select(func.count(Transaction.id)).where(Transaction.status == TransactionStatusEnum.PENDING, Transaction.gateway == "manual")
    pending_manual_transactions = db.exec(pending_tx_stmt).one()
    
    # 4. Open support tickets requiring attention
    open_tickets_stmt = select(func.count(SupportTicket.id)).where(SupportTicket.status.in_([TicketStatusEnum.OPEN, TicketStatusEnum.IN_PROGRESS]))
    open_tickets = db.exec(open_tickets_stmt).one()
    
    # 5. Top Referrers
    referrers_stmt = select(User).where(User.total_referrals > 0).order_by(User.total_referrals.desc()).limit(5)
    top_referrers = db.exec(referrers_stmt).all()
    top_referrers_data = [
        {"email": u.email, "display_name": u.display_name, "total_referrals": u.total_referrals, "id": str(u.id)}
        for u in top_referrers
    ]

    return {
        "total_users": total_users,
        "total_revenue_bdt": float(total_revenue),
        "pending_manual_transactions": pending_manual_transactions,
        "open_support_tickets": open_tickets,
        "top_referrers": top_referrers_data
    }
