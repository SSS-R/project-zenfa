# Simple mock notification service
# In a real environment, integrate with Brevo or SMS gateway.

import logging

logger = logging.getLogger(__name__)

async def send_email_notification(to_email: str, subject: str, content: str):
    """
    Sends an email notification via Brevo API (mocked for now).
    """
    logger.info(f"MOCK EMAIL => To: {to_email} | Subject: {subject} | Content: {content}")
    # TODO: Implement actual Brevo POST request

async def send_sms_notification(to_phone: str, message: str):
    """
    Sends an SMS notification via local gateway (mocked for now).
    """
    if not to_phone:
        return
    logger.info(f"MOCK SMS   => To: {to_phone} | Message: {message}")
    # TODO: Implement actual SMS gateway request

async def notify_ticket_update(user_email: str, ticket_id: str, subject: str, new_status: str, reply_text: str = None):
    """
    Helper to notify a user about a ticket update.
    """
    email_sub = f"Update on your support ticket #{str(ticket_id)[:8]}: {subject}"
    
    if reply_text:
        content = f"An agent replied:\n\n{reply_text}\n\nStatus is now: {new_status}"
    else:
        content = f"The status of your ticket changed to: {new_status}"
        
    await send_email_notification(user_email, email_sub, content)
