from sqlalchemy import Column, String, Float, Integer, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base

class Category(Base):
    __tablename__ = "categories"
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    products = relationship("Product", back_populates="category")

class Brand(Base):
    __tablename__ = "brands"
    name = Column(String(100), unique=True, index=True, nullable=False)
    products = relationship("Product", back_populates="brand")

class Product(Base):
    __tablename__ = "products"

    title = Column(String(255), index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id", ondelete="SET NULL"), nullable=True)
    
    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    
    # Condition/specs
    condition = Column(String(50), nullable=False) # e.g. "Excellent", "Good", "Fair"
    specifications = Column(JSON, nullable=True) # RAM, Storage, Color, etc.
    
    # Pricing & Inventory
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)
    images = Column(JSON, nullable=True) # Array of R2 image URLs
    videos = Column(JSON, nullable=True) # Array of R2 video URLs

    order_items = relationship("OrderItem", back_populates="product")
