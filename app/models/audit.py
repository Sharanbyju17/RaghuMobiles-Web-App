from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base

class OTPLog(Base):
    __tablename__ = "otp_logs"

    phone = Column(String(20), index=True, nullable=False)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(String(10), default="0", nullable=False) # Store as string or Integer depending on preference

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True) # e.g. "login_success", "otp_failed"
    entity = Column(String(50), nullable=True) # e.g. "user", "order"
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
