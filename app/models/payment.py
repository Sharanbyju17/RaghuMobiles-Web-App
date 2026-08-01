from sqlalchemy import Column, String, Float, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base
import enum

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, enum.Enum):
    RAZORPAY = "razorpay"
    CASH = "cash"
    CARD = "card" # POS physical card

class Payment(Base):
    __tablename__ = "payments"

    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    
    transaction_id = Column(String(255), unique=True, index=True, nullable=True) # Razorpay payment ID
    gateway_response = Column(JSON, nullable=True)

    order = relationship("Order", back_populates="payments")
