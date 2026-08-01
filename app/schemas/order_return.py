from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.order_return import ReturnStatus, ReturnReason

class OrderReturnBase(BaseModel):
    order_id: UUID
    customer_id: UUID
    reason: ReturnReason
    comments: Optional[str] = None
    refund_amount: Optional[float] = None

class OrderReturnCreate(OrderReturnBase):
    pass

class OrderReturnUpdate(BaseModel):
    status: Optional[ReturnStatus] = None
    refund_amount: Optional[float] = None

class OrderReturnResponse(OrderReturnBase):
    id: UUID
    status: ReturnStatus
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
