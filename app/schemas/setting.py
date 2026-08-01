from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any
from uuid import UUID

class SystemSettingBase(BaseModel):
    key: str = Field(..., max_length=100)
    value: Any
    description: Optional[str] = None

class SystemSettingCreate(SystemSettingBase):
    pass

class SystemSettingUpdate(BaseModel):
    value: Optional[Any] = None
    description: Optional[str] = None

class SystemSettingResponse(SystemSettingBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
