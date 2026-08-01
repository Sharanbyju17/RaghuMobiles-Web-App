import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, DateTime, String, Boolean
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID

class Base(DeclarativeBase):
    """
    Base model for all SQLAlchemy models.
    Provides default columns: id, created_at, updated_at, deleted_at, created_by, updated_by, status
    """
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)

    def soft_delete(self):
        self.deleted_at = datetime.now(timezone.utc)
        self.is_active = False

    def restore(self):
        self.deleted_at = None
        self.is_active = True
