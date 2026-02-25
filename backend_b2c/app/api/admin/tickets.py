from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID

from ...database import get_session
from ...models.support import SupportTicket, SupportMessage, TicketStatusEnum, SupportMessageBase
from ..deps import get_current_admin_user
from ..schemas import SupportTicketDetailResponse, SupportTicketResponse, SupportMessageResponse, SupportMessageCreate
from ...models.user import User
from ...services.notification_service import notify_ticket_update
from pydantic import BaseModel

class TicketUpdateStatus(BaseModel):
    status: str

router = APIRouter(dependencies=[Depends(get_current_admin_user)])

@router.get("/", response_model=List[SupportTicketResponse])
def list_all_tickets(
    status: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_session)
):
    """List all support tickets for admin queue."""
    statement = select(SupportTicket)
    if status is not None:
        try:
            status_enum = TicketStatusEnum(status.lower())
            statement = statement.where(SupportTicket.status == status_enum)
        except ValueError:
            pass
            
    # Sort by priority or just created_at
    statement = statement.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit)
    return db.exec(statement).all()

@router.get("/{ticket_id}", response_model=SupportTicketDetailResponse)
def admin_get_ticket_detail(
    ticket_id: UUID, 
    db: Session = Depends(get_session)
):
    """View full details and messages of any ticket."""
    ticket = db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.patch("/{ticket_id}/status", response_model=SupportTicketResponse)
def update_ticket_status(
    ticket_id: UUID, 
    req: TicketUpdateStatus, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session)
):
    """Resolve, close, or reopen a ticket."""
    ticket = db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    try:
        new_status = TicketStatusEnum(req.status.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    ticket.status = new_status
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Notify user of status change
    user = db.get(User, ticket.user_id)
    if user and user.email:
        background_tasks.add_task(
            notify_ticket_update,
            user.email,
            ticket.id,
            ticket.subject,
            ticket.status.value
        )
        
    return ticket

@router.post("/{ticket_id}/reply", response_model=SupportMessageResponse, status_code=status.HTTP_201_CREATED)
def admin_reply_to_ticket(
    ticket_id: UUID, 
    req: SupportMessageCreate,
    background_tasks: BackgroundTasks,
    current_admin = Depends(get_current_admin_user), 
    db: Session = Depends(get_session)
):
    """Reply to a ticket as an admin/support agent."""
    ticket = db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Auto-change status to IN_PROGRESS if we reply to an OPEN ticket
    if ticket.status == TicketStatusEnum.OPEN:
        ticket.status = TicketStatusEnum.IN_PROGRESS
        db.add(ticket)
        
    message = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current_admin.id,
        message=req.message,
        sender_role="admin"
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Notify user of the reply
    user = db.get(User, ticket.user_id)
    if user and user.email:
        background_tasks.add_task(
            notify_ticket_update,
            user.email,
            ticket.id,
            ticket.subject,
            ticket.status.value,
            req.message
        )
        
    return message
