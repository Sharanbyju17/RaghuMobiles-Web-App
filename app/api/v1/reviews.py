from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException
from app.schemas.review import ProductReviewCreate, ProductReviewUpdate, ProductReviewResponse
from app.repositories.review_repository import review_repo

router = APIRouter()

@router.post("/", response_model=ProductReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    review_in: ProductReviewCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await review_repo.create(db, obj_in=review_in)

@router.get("/product/{product_id}", response_model=List[ProductReviewResponse])
async def get_product_reviews(product_id: UUID, db: AsyncSession = Depends(get_db)):
    return await review_repo.get_by_product_id(db, product_id=product_id)

@router.put("/{id}", response_model=ProductReviewResponse)
async def update_review(
    id: UUID, review_in: ProductReviewUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    review = await review_repo.get(db, id=id)
    if not review:
        raise NotFoundException("Review not found")
    return await review_repo.update(db, db_obj=review, obj_in=review_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    review = await review_repo.get(db, id=id)
    if not review:
        raise NotFoundException("Review not found")
    await review_repo.remove(db, id=id)
    return None
