from sqlalchemy import Column, String, ForeignKey, Date, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base
import enum

class LeaveStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class LeaveType(str, enum.Enum):
    SICK = "Sick"
    CASUAL = "Casual"
    ANNUAL = "Annual"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    staff_id = Column(UUID(as_uuid=True), ForeignKey("staff_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING, nullable=False)
    
    # Manager who approved/rejected
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    staff = relationship("StaffProfile", back_populates="leave_requests")
    reviewer = relationship("User")
