from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import date
from app.models.staff import StaffStatus

class StoreBase(BaseModel):
    name: str = Field(..., max_length=100)
    address: Optional[str] = None
    contact_number: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    contact_number: Optional[str] = None
    is_active: Optional[bool] = None

class StoreResponse(StoreBase):
    id: UUID
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class StaffProfileBase(BaseModel):
    user_id: UUID
    store_id: Optional[UUID] = None
    hire_date: Optional[date] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None
    id_proof_url: Optional[str] = None

class StaffProfileCreate(StaffProfileBase):
    pass

class StaffProfileUpdate(BaseModel):
    store_id: Optional[UUID] = None
    status: Optional[StaffStatus] = None
    hire_date: Optional[date] = None
    emergency_contact: Optional[str] = None

class StaffProfileResponse(StaffProfileBase):
    id: UUID
    status: StaffStatus
    store: Optional[StoreResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- New: For creating a staff member from admin panel ---
class StaffCreateRequest(BaseModel):
    """Admin uses this to create a new staff member."""
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    store_id: Optional[UUID] = None
    id_proof_url: Optional[str] = None

class StaffUserInfo(BaseModel):
    """Nested user info in staff member response."""
    id: UUID
    phone: str
    email: Optional[str] = None
    full_name: Optional[str]
    city: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class StaffMemberResponse(BaseModel):
    """Full staff member info including user details."""
    id: UUID
    status: StaffStatus
    hire_date: Optional[date]
    emergency_contact: Optional[str]
    address: Optional[str] = None
    id_proof_url: Optional[str] = None
    store: Optional[StoreResponse]
    user: Optional[StaffUserInfo]
    model_config = ConfigDict(from_attributes=True)
