from sqlalchemy import Column, String, ForeignKey, Float, Integer, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base
import enum

class CustomerTier(str, enum.Enum):
    REGULAR = "Regular"
    SILVER = "Silver"
    GOLD = "Gold"

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Loyalty / Gamification
    tier = Column(Enum(CustomerTier), default=CustomerTier.REGULAR, nullable=False)
    total_spent = Column(Float, default=0.0, nullable=False)
    reward_points = Column(Integer, default=0, nullable=False)
    
    # Optional Address details
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)

    user = relationship("User", backref="customer_profile")
    reviews = relationship("ProductReview", back_populates="customer")
