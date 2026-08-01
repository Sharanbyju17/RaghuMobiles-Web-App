from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from app.models.payment import PaymentStatus, PaymentMethod

class PaymentBase(BaseModel):
    order_id: UUID
    amount: float = Field(..., ge=0)
    method: PaymentMethod

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    transaction_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None

class PaymentResponse(PaymentBase):
    id: UUID
    status: PaymentStatus
    transaction_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RazorpayOrderCreate(BaseModel):
    amount: float = Field(..., ge=1)
    currency: str = "INR"
    receipt: str
