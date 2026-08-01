from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.repositories.order_repository import order_repo
from app.repositories.inventory_repository import product_repo

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Depending on roles, you might set user_id to current_user.id if order_in.user_id is None
    if not order_in.user_id and current_user.roles and current_user.roles[0].role.name == "customer":
        order_in.user_id = current_user.id
        
    # Validation: Check if products exist and have enough stock
    for item in order_in.items:
        product = await product_repo.get(db, id=item.product_id)
        if not product:
            raise NotFoundException(f"Product with id {item.product_id} not found")
        # Optional: Check stock quantity here, decrement stock etc.
        
    order = await order_repo.create_with_items(db, obj_in=order_in)
    return order

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Here you might want to filter by user_id if the user is a customer
    # For now, get all
    return await order_repo.get_all(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    order = await order_repo.get(db, id=id)
    if not order:
        raise NotFoundException("Order not found")
    return order

@router.put("/{id}", response_model=OrderResponse)
async def update_order(
    id: UUID,
    order_in: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = await order_repo.get(db, id=id)
    if not order:
        raise NotFoundException("Order not found")
        
    return await order_repo.update(db, db_obj=order, obj_in=order_in)
