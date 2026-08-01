from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID

class ProductReviewBase(BaseModel):
    product_id: UUID
    customer_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ProductReviewCreate(ProductReviewBase):
    pass

class ProductReviewUpdate(BaseModel):
    is_approved: Optional[bool] = None

class ProductReviewResponse(ProductReviewBase):
    id: UUID
    is_verified_purchase: bool
    is_approved: bool
    model_config = ConfigDict(from_attributes=True)
