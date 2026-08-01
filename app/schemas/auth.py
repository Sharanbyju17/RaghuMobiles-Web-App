from pydantic import BaseModel, Field, constr
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number with country code", min_length=10, max_length=15)

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number with country code")
    otp: str = Field(..., description="6 digit OTP", min_length=6, max_length=6)
    full_name: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class UserProfile(BaseModel):
    id: UUID
    phone: str
    full_name: Optional[str] = None
    city: Optional[str] = None
    role: str
    permissions: List[str]
    created_at: datetime

class AuthResponse(BaseModel):
    success: bool
    is_new_user: bool = False
    tokens: Optional[TokenResponse] = None
    user: Optional[UserProfile] = None
