from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime

from ..database import get_session
from ..models.user import User
from ..models.support import SupportTicket, SupportMessage, TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum
from .deps import get_current_user
from .schemas import SupportTicketCreate, SupportTicketResponse, SupportTicketDetailResponse, SupportMessageCreate, SupportMessageResponse
from ..services.notification_service import send_email_notification

router = APIRouter()

@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_user_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Retrieve all support tickets for the logged-in user."""
    statement = select(SupportTicket).where(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc())
    return db.exec(statement).all()

@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    req: SupportTicketCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new support ticket."""
    try:
        category = TicketCategoryEnum(req.category.lower())
    except ValueError:
        category = TicketCategoryEnum.OTHER
        
    try:
        priority = TicketPriorityEnum(req.priority.lower() if req.priority else "normal")
    except ValueError:
        priority = TicketPriorityEnum.NORMAL
        
    ticket = SupportTicket(
        user_id=current_user.id,
        subject=req.subject,
        category=category,
        priority=priority,
        status=TicketStatusEnum.OPEN
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Notify user of ticket creation
    email_subject = f"Support Ticket Created: {ticket.subject}"
    email_body = f"Hello {current_user.display_name or 'User'},\n\nWe have received your support ticket (#{str(ticket.id)[:8]}). Our team will get back to you soon.\n\nCategory: {ticket.category.value}\nPriority: {ticket.priority.value}\n\nThanks,\nPC Lagbe Team"
    background_tasks.add_task(send_email_notification, current_user.email, email_subject, email_body)
    
    return ticket

@router.get("/tickets/{ticket_id}", response_model=SupportTicketDetailResponse)
def get_ticket_detail(
    ticket_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get details of a specific ticket, including all messages."""
    statement = select(SupportTicket).where(
        SupportTicket.id == ticket_id, 
        SupportTicket.user_id == current_user.id
    )
    ticket = db.exec(statement).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        
    return ticket

@router.post("/tickets/{ticket_id}/reply", response_model=SupportMessageResponse, status_code=status.HTTP_201_CREATED)
def reply_to_ticket(
    ticket_id: UUID,
    req: SupportMessageCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Add a new message to a ticket."""
    statement = select(SupportTicket).where(
        SupportTicket.id == ticket_id, 
        SupportTicket.user_id == current_user.id
    )
    ticket = db.exec(statement).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        
    # User replying directly re-opens ticket if it was resolved/closed
    if ticket.status in (TicketStatusEnum.RESOLVED, TicketStatusEnum.CLOSED):
        ticket.status = TicketStatusEnum.IN_PROGRESS
        db.add(ticket)
        
    message = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=req.message,
        sender_role="user"
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Optional: Notify admin that user replied (omitted for now to prevent spam, could be added later)
    
    return message
