from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from uuid import UUID

# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: UUID
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# Brand Schemas
class BrandBase(BaseModel):
    name: str = Field(..., max_length=100)

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class BrandResponse(BrandBase):
    id: UUID
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# Product Schemas
class ProductBase(BaseModel):
    title: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=100)
    description: Optional[str] = None
    condition: str = Field(..., max_length=50)
    specifications: Optional[Dict[str, Any]] = None
    price: float = Field(..., ge=0)
    stock_quantity: int = Field(0, ge=0)
    images: Optional[List[str]] = []
    videos: Optional[List[str]] = []
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    condition: Optional[str] = Field(None, max_length=50)
    specifications: Optional[Dict[str, Any]] = None
    price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    images: Optional[List[str]] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: UUID
    is_active: bool
    category: Optional[CategoryResponse] = None
    brand: Optional[BrandResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
