from typing import Optional, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.staff import StaffProfile, Store
from app.schemas.staff import StaffProfileCreate, StaffProfileUpdate, StoreCreate, StoreUpdate

class StoreRepository(BaseRepository[Store, StoreCreate, StoreUpdate]):
    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Store]:
        query = select(Store).where(Store.name == name, Store.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

class StaffProfileRepository(BaseRepository[StaffProfile, StaffProfileCreate, StaffProfileUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: Any) -> Optional[StaffProfile]:
        query = select(StaffProfile).options(
            selectinload(StaffProfile.user),
            selectinload(StaffProfile.store)
        ).where(StaffProfile.user_id == user_id, StaffProfile.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all_with_users(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[StaffProfile]:
        """Get all staff profiles with user and store info eager loaded."""
        query = (
            select(StaffProfile)
            .options(
                selectinload(StaffProfile.user),
                selectinload(StaffProfile.store)
            )
            .where(StaffProfile.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

store_repo = StoreRepository(Store)
staff_profile_repo = StaffProfileRepository(StaffProfile)
