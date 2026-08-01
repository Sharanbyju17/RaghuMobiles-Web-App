from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException
from app.schemas.leave import LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestResponse
from app.repositories.leave_repository import leave_repo

router = APIRouter()

from app.repositories.staff_repository import staff_profile_repo
from fastapi import HTTPException

@router.post("/", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def request_leave(
    leave_in: LeaveRequestCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Auto-assign staff_id if not provided, based on current user
    if not leave_in.staff_id:
        profile = await staff_profile_repo.get_by_user_id(db, user_id=current_user.id)
        if not profile:
            raise HTTPException(status_code=400, detail="Current user is not a staff member")
        leave_in.staff_id = profile.id
        
    return await leave_repo.create(db, obj_in=leave_in)

@router.get("/", response_model=List[LeaveRequestResponse])
async def get_leaves(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all leave requests with staff info. Admin sees all."""
    leaves = await leave_repo.get_all_with_staff(db, skip=skip, limit=limit)
    
    # Enrich response with staff user info
    result = []
    for leave in leaves:
        staff_name = None
        staff_phone = None
        if leave.staff and leave.staff.user:
            staff_name = leave.staff.user.full_name
            staff_phone = leave.staff.user.phone
        
        result.append(LeaveRequestResponse(
            id=leave.id,
            staff_id=leave.staff_id,
            leave_type=leave.leave_type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            reason=leave.reason,
            status=leave.status,
            reviewed_by_id=leave.reviewed_by_id,
            staff_name=staff_name,
            staff_phone=staff_phone,
        ))
    
    return result

@router.get("/staff/{staff_id}", response_model=List[LeaveRequestResponse])
async def get_staff_leaves(staff_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await leave_repo.get_by_staff_id(db, staff_id=staff_id)

@router.put("/{id}", response_model=LeaveRequestResponse)
async def update_leave_status(
    id: UUID, update_in: LeaveRequestUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    leave = await leave_repo.get(db, id=id)
    if not leave:
        raise NotFoundException("Leave request not found")
        
    # Auto-assign reviewer to the current user if status is changed
    if update_in.status and not update_in.reviewed_by_id:
        update_in.reviewed_by_id = current_user.id
        
    updated = await leave_repo.update(db, db_obj=leave, obj_in=update_in)
    
    # Return with staff info
    staff_name = None
    staff_phone = None
    if hasattr(updated, 'staff') and updated.staff and updated.staff.user:
        staff_name = updated.staff.user.full_name
        staff_phone = updated.staff.user.phone
    
    return LeaveRequestResponse(
        id=updated.id,
        staff_id=updated.staff_id,
        leave_type=updated.leave_type,
        start_date=updated.start_date,
        end_date=updated.end_date,
        reason=updated.reason,
        status=updated.status,
        reviewed_by_id=updated.reviewed_by_id,
        staff_name=staff_name,
        staff_phone=staff_phone,
    )
