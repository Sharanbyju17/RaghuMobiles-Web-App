from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException, ConflictException
from app.schemas.setting import SystemSettingCreate, SystemSettingUpdate, SystemSettingResponse
from app.repositories.setting_repository import system_setting_repo

router = APIRouter()

@router.post("/", response_model=SystemSettingResponse, status_code=status.HTTP_201_CREATED)
async def create_setting(
    setting_in: SystemSettingCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    existing = await system_setting_repo.get_by_key(db, key=setting_in.key)
    if existing:
        raise ConflictException("Setting key already exists")
    return await system_setting_repo.create(db, obj_in=setting_in)

@router.get("/", response_model=List[SystemSettingResponse])
async def get_settings(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await system_setting_repo.get_all(db, skip=skip, limit=limit)

@router.get("/{key}", response_model=SystemSettingResponse)
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    setting = await system_setting_repo.get_by_key(db, key=key)
    if not setting:
        raise NotFoundException("Setting not found")
    return setting

@router.put("/{key}", response_model=SystemSettingResponse)
async def update_setting(
    key: str, update_in: SystemSettingUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    setting = await system_setting_repo.get_by_key(db, key=key)
    if not setting:
        raise NotFoundException("Setting not found")
    return await system_setting_repo.update(db, db_obj=setting, obj_in=update_in)
