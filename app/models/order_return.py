from sqlalchemy import Column, String, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base
import enum

class ReturnStatus(str, enum.Enum):
    REQUESTED = "Requested"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    IN_TRANSIT = "In Transit"
    RECEIVED = "Received"
    REFUNDED = "Refunded"

class ReturnReason(str, enum.Enum):
    DEFECTIVE = "Defective"
    NOT_AS_DESCRIBED = "Not as described"
    CHANGED_MIND = "Changed Mind"
    OTHER = "Other"

class OrderReturn(Base):
    __tablename__ = "order_returns"

    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status = Column(Enum(ReturnStatus), default=ReturnStatus.REQUESTED, nullable=False)
    reason = Column(Enum(ReturnReason), nullable=False)
    comments = Column(Text, nullable=True)
    
    refund_amount = Column(Float, nullable=True)

    order = relationship("Order")
    customer = relationship("CustomerProfile")
