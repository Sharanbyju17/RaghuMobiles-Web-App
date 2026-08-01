from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from datetime import date
from app.models.leave import LeaveStatus, LeaveType

class LeaveRequestBase(BaseModel):
    staff_id: UUID
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    staff_id: Optional[UUID] = None

class LeaveRequestUpdate(BaseModel):
    status: Optional[LeaveStatus] = None
    reviewed_by_id: Optional[UUID] = None

class StaffInfoForLeave(BaseModel):
    """Minimal staff info embedded in leave response."""
    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    phone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LeaveRequestResponse(LeaveRequestBase):
    id: UUID
    status: LeaveStatus
    reviewed_by_id: Optional[UUID]
    # Staff info will be populated by the API layer
    staff_name: Optional[str] = None
    staff_phone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
