from sqlalchemy import Column, String, JSON
from app.database.base import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False) # Can store string, int, list, dict
    description = Column(String(255), nullable=True)
