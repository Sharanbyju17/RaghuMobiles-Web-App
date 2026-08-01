from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.inventory import Category, Brand, Product
from app.schemas.inventory import (
    CategoryCreate, CategoryUpdate,
    BrandCreate, BrandUpdate,
    ProductCreate, ProductUpdate
)

class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Category]:
        query = select(Category).where(Category.name == name, Category.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

class BrandRepository(BaseRepository[Brand, BrandCreate, BrandUpdate]):
    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Brand]:
        query = select(Brand).where(Brand.name == name, Brand.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

class ProductRepository(BaseRepository[Product, ProductCreate, ProductUpdate]):
    async def get_by_sku(self, db: AsyncSession, *, sku: str) -> Optional[Product]:
        query = select(Product).options(
            selectinload(Product.category),
            selectinload(Product.brand)
        ).where(Product.sku == sku, Product.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()
        
    async def get(self, db: AsyncSession, id: str) -> Optional[Product]:
        query = select(Product).options(
            selectinload(Product.category),
            selectinload(Product.brand)
        ).where(Product.id == id, Product.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Product]:
        query = select(Product).options(
            selectinload(Product.category),
            selectinload(Product.brand)
        ).where(Product.is_active == True).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

category_repo = CategoryRepository(Category)
brand_repo = BrandRepository(Brand)
product_repo = ProductRepository(Product)
