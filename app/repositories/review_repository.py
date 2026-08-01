from typing import Optional, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.review import ProductReview
from app.schemas.review import ProductReviewCreate, ProductReviewUpdate

class ProductReviewRepository(BaseRepository[ProductReview, ProductReviewCreate, ProductReviewUpdate]):
    async def get_by_product_id(self, db: AsyncSession, *, product_id: Any) -> List[ProductReview]:
        query = select(ProductReview).where(ProductReview.product_id == product_id, ProductReview.is_active == True)
        result = await db.execute(query)
        return list(result.scalars().all())

review_repo = ProductReviewRepository(ProductReview)
