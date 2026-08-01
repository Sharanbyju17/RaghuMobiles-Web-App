from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException
from app.schemas.order_return import OrderReturnCreate, OrderReturnUpdate, OrderReturnResponse
from app.repositories.order_return_repository import order_return_repo

router = APIRouter()

@router.post("/", response_model=OrderReturnResponse, status_code=status.HTTP_201_CREATED)
async def create_return(
    return_in: OrderReturnCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await order_return_repo.create(db, obj_in=return_in)

@router.get("/", response_model=List[OrderReturnResponse])
async def get_returns(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await order_return_repo.get_all(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=OrderReturnResponse)
async def get_return(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    ret = await order_return_repo.get(db, id=id)
    if not ret:
        raise NotFoundException("Return request not found")
    return ret

@router.put("/{id}", response_model=OrderReturnResponse)
async def update_return(
    id: UUID, return_in: OrderReturnUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    ret = await order_return_repo.get(db, id=id)
    if not ret:
        raise NotFoundException("Return request not found")
    return await order_return_repo.update(db, db_obj=ret, obj_in=return_in)
