from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.order import OrderStatus, OrderType

class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    subtotal: float = Field(..., ge=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: UUID
    order_id: UUID
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    user_id: Optional[UUID] = None
    order_type: OrderType = OrderType.ONLINE
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = Field(..., ge=0)
    tax_amount: float = Field(0.0, ge=0)
    discount_amount: float = Field(0.0, ge=0)
    final_amount: float = Field(..., ge=0)
    handled_by_id: Optional[UUID] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    handled_by_id: Optional[UUID] = None

class OrderResponse(OrderBase):
    id: UUID
    order_number: str
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
