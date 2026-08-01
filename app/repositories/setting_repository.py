from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.setting import SystemSetting
from app.schemas.setting import SystemSettingCreate, SystemSettingUpdate

class SystemSettingRepository(BaseRepository[SystemSetting, SystemSettingCreate, SystemSettingUpdate]):
    async def get_by_key(self, db: AsyncSession, *, key: str) -> Optional[SystemSetting]:
        query = select(SystemSetting).where(SystemSetting.key == key, SystemSetting.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

system_setting_repo = SystemSettingRepository(SystemSetting)
