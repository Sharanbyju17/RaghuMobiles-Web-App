from typing import Optional, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate

class NotificationRepository(BaseRepository[Notification, NotificationCreate, NotificationUpdate]):
    async def get_user_notifications(self, db: AsyncSession, *, user_id: Any, unread_only: bool = False) -> List[Notification]:
        query = select(Notification).where(
            (Notification.user_id == user_id) | (Notification.user_id == None),
            Notification.is_active == True
        ).order_by(Notification.created_at.desc())
        
        if unread_only:
            query = query.where(Notification.is_read == False)
            
        result = await db.execute(query)
        return list(result.scalars().all())

notification_repo = NotificationRepository(Notification)
