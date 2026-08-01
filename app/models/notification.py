from sqlalchemy import Column, String, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base
import enum

class NotificationType(str, enum.Enum):
    INFO = "Info"
    SUCCESS = "Success"
    WARNING = "Warning"
    ERROR = "Error"
    PROMO = "Promo"

class Notification(Base):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO, nullable=False)
    
    is_read = Column(Boolean, default=False)
    
    # If user_id is null, it's a broadcast/system notification
    user = relationship("User")
