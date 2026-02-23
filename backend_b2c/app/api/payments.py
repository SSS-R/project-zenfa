from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from ..database import get_session
from ..models.user import User
from ..models.transaction import Transaction, PackageEnum, GatewayEnum, TransactionStatusEnum
from .deps import get_current_user
from .schemas import TransactionInitiateRequest, TransactionResponse

router = APIRouter()

# Package configurations
PACKAGE_DETAILS = {
    PackageEnum.STARTER: {"amount": 50.0, "tokens": 30},
    PackageEnum.PRO: {"amount": 100.0, "tokens": 70},
    PackageEnum.ENTHUSIAST: {"amount": 350.0, "tokens": 300}
}

@router.post("/initiate", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def initiate_payment(
    req: TransactionInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Initiate a payment or submit a manual TrxID for admin review."""
    
    # 1. Validate package
    try:
        package_enum = PackageEnum(req.package.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid package. Must be one of: {', '.join([e.value for e in PackageEnum])}"
        )
        
    # 2. Validate gateway
    try:
        gateway_enum = GatewayEnum(req.gateway.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid gateway. Must be one of: {', '.join([e.value for e in GatewayEnum])}"
        )
        
    # 3. Handle manual gateway TrxID requirement
    if gateway_enum == GatewayEnum.MANUAL and not req.gateway_trx_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A gateway_trx_id is required when using the manual payment gateway"
        )
        
    # 4. Fetch details
    details = PACKAGE_DETAILS[package_enum]
    
    # 5. Create pending transaction
    tx = Transaction(
        user_id=current_user.id,
        gateway=gateway_enum,
        amount_bdt=details["amount"],
        package=package_enum,
        tokens_granted=details["tokens"],
        status=TransactionStatusEnum.PENDING,
        gateway_trx_id=req.gateway_trx_id
    )
    
    db.add(tx)
    db.commit()
    db.refresh(tx)
    
    return tx
