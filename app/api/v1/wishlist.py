from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.models.wishlist import WishlistItem
from app.models.user import User
from app.schemas.cart import WishlistItemResponse, WishlistToggleRequest
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[WishlistItemResponse])
async def get_wishlist(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WishlistItem).where(WishlistItem.user_id == current_user.id))
    return result.scalars().all()

@router.post("/toggle", response_model=dict)
async def toggle_wishlist_item(
    request: WishlistToggleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == request.product_id
        )
    )
    existing_item = result.scalars().first()

    if existing_item:
        await db.delete(existing_item)
        await db.commit()
        return {"status": "removed", "product_id": str(request.product_id)}
    else:
        new_item = WishlistItem(user_id=current_user.id, product_id=request.product_id)
        db.add(new_item)
        await db.commit()
        return {"status": "added", "product_id": str(request.product_id)}
