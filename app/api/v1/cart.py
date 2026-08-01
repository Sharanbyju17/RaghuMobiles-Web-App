from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.models.cart import Cart, CartItem
from app.models.user import User
from app.schemas.cart import CartResponse, CartItemBase
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=CartResponse)
async def get_cart(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Cart).where(Cart.user_id == current_user.id).options(selectinload(Cart.items))
    )
    cart = result.scalars().first()
    
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
        
    return cart

@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item: CartItemBase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get or create cart
    result = await db.execute(select(Cart).where(Cart.user_id == current_user.id).options(selectinload(Cart.items)))
    cart = result.scalars().first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)

    # Check if item exists in cart
    existing_item = next((i for i in cart.items if i.product_id == item.product_id), None)
    if existing_item:
        existing_item.quantity += item.quantity
    else:
        new_item = CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)
        db.add(new_item)

    await db.commit()
    await db.refresh(cart)
    
    # Reload with items
    result = await db.execute(select(Cart).where(Cart.id == cart.id).options(selectinload(Cart.items)))
    cart = result.scalars().first()
    return cart

@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_item_from_cart(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Cart).where(Cart.user_id == current_user.id).options(selectinload(Cart.items)))
    cart = result.scalars().first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item_to_remove = next((i for i in cart.items if i.product_id == product_id), None)
    if item_to_remove:
        await db.delete(item_to_remove)
        await db.commit()
        await db.refresh(cart)

    result = await db.execute(select(Cart).where(Cart.id == cart.id).options(selectinload(Cart.items)))
    cart = result.scalars().first()
    return cart
