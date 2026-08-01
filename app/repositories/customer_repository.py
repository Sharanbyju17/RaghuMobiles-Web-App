from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.customer import CustomerProfile
from app.schemas.customer import CustomerProfileCreate, CustomerProfileUpdate

class CustomerProfileRepository(BaseRepository[CustomerProfile, CustomerProfileCreate, CustomerProfileUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: Any) -> Optional[CustomerProfile]:
        query = select(CustomerProfile).options(selectinload(CustomerProfile.user)).where(CustomerProfile.user_id == user_id, CustomerProfile.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

customer_profile_repo = CustomerProfileRepository(CustomerProfile)
