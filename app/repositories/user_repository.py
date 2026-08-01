from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.user import User
from app.models.role import UserRole, Role
from app.models.permission import RolePermission
from app.schemas.user import UserCreate, UserUpdate

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    async def get_by_phone(self, db: AsyncSession, *, phone: str) -> Optional[User]:
        query = select(User).options(
            selectinload(User.roles).selectinload(UserRole.role).selectinload(Role.permissions).selectinload(RolePermission.permission)
        ).where(User.phone == phone, User.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

user_repo = UserRepository(User)
