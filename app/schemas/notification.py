from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.notification import NotificationType

class NotificationBase(BaseModel):
    user_id: Optional[UUID] = None
    title: str = Field(..., max_length=255)
    message: str
    type: NotificationType = NotificationType.INFO

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: UUID
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
