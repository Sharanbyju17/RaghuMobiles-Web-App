from pydantic import BaseModel
from typing import List
from uuid import UUID

class CartItemBase(BaseModel):
    product_id: UUID
    quantity: int = 1

class CartItemResponse(CartItemBase):
    id: UUID
    cart_id: UUID

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: UUID
    user_id: UUID
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True

class WishlistToggleRequest(BaseModel):
    product_id: UUID

class WishlistItemResponse(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID

    class Config:
        from_attributes = True
