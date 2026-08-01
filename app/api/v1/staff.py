from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.database.session import get_db, get_redis
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.role import Role, UserRole
from app.core.exceptions import NotFoundException, ConflictException
from app.schemas.staff import (
    StaffProfileCreate, StaffProfileUpdate, StaffProfileResponse,
    StoreCreate, StoreUpdate, StoreResponse,
    StaffCreateRequest, StaffMemberResponse
)
from app.schemas.user import UserCreate
from app.repositories.staff_repository import staff_profile_repo, store_repo
from app.repositories.user_repository import user_repo
from app.services.auth_service import AuthService
from app.services.media_service import media_service
from fastapi import UploadFile, File

router = APIRouter()

# --- Stores ---
@router.post("/stores", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def create_store(
    store_in: StoreCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    existing = await store_repo.get_by_name(db, name=store_in.name)
    if existing:
        raise ConflictException("Store already exists")
    return await store_repo.create(db, obj_in=store_in)

@router.get("/stores", response_model=List[StoreResponse])
async def get_stores(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await store_repo.get_all(db, skip=skip, limit=limit)

# --- Create Staff Member (Admin flow) ---
@router.post("/create-member", response_model=StaffMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_staff_member(
    staff_in: StaffCreateRequest,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Admin endpoint: creates a new user with staff role and a staff profile.
    Also triggers OTP to the staff phone (logged to terminal in dev).
    """
    # 1. Check if user with this phone already exists
    existing_user = await user_repo.get_by_phone(db, phone=staff_in.phone)
    if existing_user:
        # Check if they already have a staff profile
        existing_profile = await staff_profile_repo.get_by_user_id(db, user_id=existing_user.id)
        if existing_profile:
            raise ConflictException("A staff member with this phone number already exists")
        new_user = existing_user
    else:
        # 2. Create the user
        new_user = await user_repo.create(
            db,
            obj_in=UserCreate(
                phone=staff_in.phone,
                email=staff_in.email,
                full_name=staff_in.full_name,
                city=staff_in.address or ""
            )
        )

    # 3. Assign "staff" role
    staff_role_result = await db.execute(select(Role).where(Role.name == "staff"))
    staff_role = staff_role_result.scalars().first()
    if staff_role:
        # Check if already has this role
        existing_role = await db.execute(
            select(UserRole).where(UserRole.user_id == new_user.id, UserRole.role_id == staff_role.id)
        )
        if not existing_role.scalars().first():
            ur = UserRole(user_id=new_user.id, role_id=staff_role.id)
            db.add(ur)
            await db.flush()

    # 4. Create staff profile
    profile = await staff_profile_repo.create(
        db,
        obj_in=StaffProfileCreate(
            user_id=new_user.id,
            store_id=staff_in.store_id,
            hire_date=None,
            emergency_contact=None,
            address=staff_in.address,
            id_proof_url=staff_in.id_proof_url
        )
    )

    # 5. Send OTP (logged to terminal in dev) so staff can complete login
    auth_service = AuthService(db, redis)
    await auth_service.send_otp(staff_in.phone)

    # 6. Reload with relationships
    profile = await staff_profile_repo.get_by_user_id(db, user_id=new_user.id)
    return profile

# --- Staff CRUD ---
@router.get("/", response_model=List[StaffMemberResponse])
async def get_staff(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await staff_profile_repo.get_all_with_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=StaffMemberResponse)
async def get_staff_by_user(user_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = await staff_profile_repo.get_by_user_id(db, user_id=user_id)
    if not profile:
        raise NotFoundException("Staff profile not found")
    return profile

@router.put("/{id}", response_model=StaffProfileResponse)
async def update_staff(
    id: UUID, profile_in: StaffProfileUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = await staff_profile_repo.get(db, id=id)
    if not profile:
        raise NotFoundException("Staff profile not found")
    return await staff_profile_repo.update(db, db_obj=profile, obj_in=profile_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = await staff_profile_repo.get(db, id=id)
    if not profile:
        raise NotFoundException("Staff profile not found")
    await staff_profile_repo.remove(db, id=id)
    return None

@router.post("/upload-id", response_model=dict)
async def upload_staff_id(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Admin endpoint to upload an ID proof document for a staff member.
    Returns the URL to the uploaded file.
    """
    import os
    import uuid
    import mimetypes
    import shutil

    # Ensure local directory exists
    os.makedirs("uploads", exist_ok=True)

    # Generate unique filename
    ext = mimetypes.guess_extension(file.content_type) or ""
    if not ext and file.filename:
        parts = file.filename.split(".")
        if len(parts) > 1:
            ext = f".{parts[-1]}"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", unique_name)

    # Save locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"http://localhost:8000/uploads/{unique_name}"
    return {"url": url}
