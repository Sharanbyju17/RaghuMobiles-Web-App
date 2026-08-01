from sqlalchemy import Column, String, ForeignKey, Date, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base
import enum

class StaffStatus(str, enum.Enum):
    ACTIVE = "Active"
    OFF_DUTY = "Off-duty"
    ON_LEAVE = "On Leave"
    TERMINATED = "Terminated"

class Store(Base):
    __tablename__ = "stores"
    name = Column(String(100), unique=True, index=True, nullable=False)
    address = Column(Text, nullable=True)
    contact_number = Column(String(20), nullable=True)
    
    staff_members = relationship("StaffProfile", back_populates="store")

class StaffProfile(Base):
    __tablename__ = "staff_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(Enum(StaffStatus), default=StaffStatus.ACTIVE, nullable=False)
    hire_date = Column(Date, nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    id_proof_url = Column(String(255), nullable=True)

    user = relationship("User", backref="staff_profile")
    store = relationship("Store", back_populates="staff_members")
    leave_requests = relationship("LeaveRequest", back_populates="staff")
