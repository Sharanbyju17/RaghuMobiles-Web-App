from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException
from app.schemas.notification import NotificationCreate, NotificationUpdate, NotificationResponse
from app.repositories.notification_repository import notification_repo

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    unread_only: bool = False, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await notification_repo.get_user_notifications(db, user_id=current_user.id, unread_only=unread_only)

@router.put("/{id}/read", response_model=NotificationResponse)
async def mark_as_read(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    notif = await notification_repo.get(db, id=id)
    if not notif:
        raise NotFoundException("Notification not found")
    return await notification_repo.update(db, db_obj=notif, obj_in=NotificationUpdate(is_read=True))
