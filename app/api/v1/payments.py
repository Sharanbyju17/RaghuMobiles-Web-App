from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
import razorpay
import hmac
import hashlib

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.config import settings
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse, RazorpayOrderCreate
from app.repositories.payment_repository import payment_repo
from app.repositories.order_repository import order_repo
from app.models.payment import PaymentStatus, PaymentMethod

router = APIRouter()

def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.post("/razorpay/create-order", response_model=dict)
async def create_razorpay_order(
    order_data: RazorpayOrderCreate,
    current_user: User = Depends(get_current_user)
):
    """Creates a Razorpay order ID to be used by the frontend checkout"""
    client = get_razorpay_client()
    
    # Razorpay requires amount in paise (multiply by 100)
    data = {
        "amount": int(order_data.amount * 100),
        "currency": order_data.currency,
        "receipt": order_data.receipt
    }
    
    try:
        razorpay_order = client.order.create(data=data)
        return razorpay_order
    except Exception as e:
        raise BadRequestException(f"Failed to create Razorpay order: {str(e)}")

@router.post("/razorpay/verify", response_model=PaymentResponse)
async def verify_razorpay_payment(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Webhook or direct call from frontend to verify payment signature and mark order as paid"""
    data = await request.json()
    
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    order_id = data.get("order_id") # our internal order ID
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id]):
        raise BadRequestException("Missing payment verification parameters")
        
    client = get_razorpay_client()
    
    try:
        # Verify signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise BadRequestException("Invalid payment signature")
        
    # Signature is valid, update our payment and order records
    order = await order_repo.get(db, id=order_id)
    if not order:
        raise NotFoundException("Order not found")
        
    # Create the payment record
    payment_in = PaymentCreate(
        order_id=order.id,
        amount=order.final_amount,
        method=PaymentMethod.RAZORPAY
    )
    payment = await payment_repo.create(db, obj_in=payment_in)
    
    # Update payment to Success
    payment_update = PaymentUpdate(
        status=PaymentStatus.SUCCESS,
        transaction_id=razorpay_payment_id,
        gateway_response=data
    )
    payment = await payment_repo.update(db, db_obj=payment, obj_in=payment_update)
    
    return payment

@router.get("/order/{order_id}", response_model=List[PaymentResponse])
async def get_order_payments(
    order_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return await payment_repo.get_by_order_id(db, order_id=order_id)
