from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.audit import ActivityLog
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any

router = APIRouter()

class ActivityLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    action: str
    details: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[ActivityLogResponse])
async def get_audit_logs(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Only allow admins
    query = select(ActivityLog).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())
