from sqlalchemy import Column, String, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base

class ProductReview(Base):
    __tablename__ = "product_reviews"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    is_verified_purchase = Column(Boolean, default=False)
    
    # Moderation
    is_approved = Column(Boolean, default=True) # Assuming auto-approve, or set to False if manual approval needed

    product = relationship("Product")
    customer = relationship("CustomerProfile", back_populates="reviews")
