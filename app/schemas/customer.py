from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from app.models.customer import CustomerTier

class CustomerProfileBase(BaseModel):
    user_id: UUID
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class CustomerProfileCreate(CustomerProfileBase):
    pass

class CustomerProfileUpdate(BaseModel):
    tier: Optional[CustomerTier] = None
    total_spent: Optional[float] = None
    reward_points: Optional[int] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class CustomerProfileResponse(CustomerProfileBase):
    id: UUID
    tier: CustomerTier
    total_spent: float
    reward_points: int
    model_config = ConfigDict(from_attributes=True)
