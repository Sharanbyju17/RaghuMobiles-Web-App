from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    phone: str = Field(..., max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    full_name: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=255)

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    phone: Optional[str] = Field(None, max_length=20)
    full_name: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None

class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    roles: List[RoleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
