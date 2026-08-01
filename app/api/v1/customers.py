from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException, ConflictException
from app.schemas.customer import CustomerProfileCreate, CustomerProfileUpdate, CustomerProfileResponse
from app.repositories.customer_repository import customer_profile_repo

router = APIRouter()

@router.post("/", response_model=CustomerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_profile(
    profile_in: CustomerProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = await customer_profile_repo.get_by_user_id(db, user_id=profile_in.user_id)
    if existing:
        raise ConflictException("Customer profile already exists for this user")
    return await customer_profile_repo.create(db, obj_in=profile_in)

@router.get("/", response_model=List[CustomerProfileResponse])
async def get_customers(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await customer_profile_repo.get_all(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=CustomerProfileResponse)
async def get_customer_by_user(
    user_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = await customer_profile_repo.get_by_user_id(db, user_id=user_id)
    if not profile:
        raise NotFoundException("Customer profile not found")
    return profile

@router.put("/{id}", response_model=CustomerProfileResponse)
async def update_customer(
    id: UUID,
    profile_in: CustomerProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = await customer_profile_repo.get(db, id=id)
    if not profile:
        raise NotFoundException("Customer profile not found")
        
    return await customer_profile_repo.update(db, db_obj=profile, obj_in=profile_in)
