from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.repositories.user_repository import user_repo
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException, ConflictException

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check for existing user by phone
    existing = await user_repo.get_by_phone(db, phone=user_in.phone)
    if existing:
        raise ConflictException(message="User with this phone number already exists.")
    
    user = await user_repo.create(db, obj_in=user_in)
    return user

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = await user_repo.get_all(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = await user_repo.get(db, id=user_id)
    if not user:
        raise NotFoundException(message="User not found.")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = await user_repo.get(db, id=user_id)
    if not user:
        raise NotFoundException(message="User not found.")
        
    if user_in.phone and user_in.phone != user.phone:
        existing = await user_repo.get_by_phone(db, phone=user_in.phone)
        if existing:
            raise ConflictException(message="User with this phone number already exists.")
            
    user = await user_repo.update(db, db_obj=user, obj_in=user_in)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = await user_repo.get(db, id=user_id)
    if not user:
        raise NotFoundException(message="User not found.")
        
    await user_repo.remove(db, id=user_id)
    return None
