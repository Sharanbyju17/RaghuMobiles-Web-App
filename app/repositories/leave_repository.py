from typing import Optional, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.leave import LeaveRequest
from app.models.staff import StaffProfile
from app.schemas.leave import LeaveRequestCreate, LeaveRequestUpdate

class LeaveRequestRepository(BaseRepository[LeaveRequest, LeaveRequestCreate, LeaveRequestUpdate]):
    async def get_by_staff_id(self, db: AsyncSession, *, staff_id: Any) -> List[LeaveRequest]:
        query = (
            select(LeaveRequest)
            .options(selectinload(LeaveRequest.staff).selectinload(StaffProfile.user))
            .where(LeaveRequest.staff_id == staff_id, LeaveRequest.is_active == True)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_all_with_staff(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
        """Get all leave requests with staff + user info eager loaded."""
        query = (
            select(LeaveRequest)
            .options(selectinload(LeaveRequest.staff).selectinload(StaffProfile.user))
            .where(LeaveRequest.is_active == True)
            .order_by(LeaveRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

leave_repo = LeaveRequestRepository(LeaveRequest)
