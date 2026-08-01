from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from app.database.session import get_db, get_redis
from app.schemas.auth import SendOTPRequest, VerifyOTPRequest, RefreshRequest, AuthResponse, TokenResponse, UserProfile
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user, reusable_oauth2
from app.models.user import User
import jwt
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.post("/send-otp", response_model=dict)
async def send_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    service = AuthService(db, redis)
    success = await service.send_otp(request.phone)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    service = AuthService(db, redis)
    response = await service.verify_otp(
        phone=request.phone, 
        otp=request.otp, 
        full_name=request.full_name, 
        city=request.city,
        email=request.email
    )
    return response

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    try:
        payload = jwt.decode(request.refresh_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        
        user_id = payload.get("sub")
        is_blacklisted = await redis.get(f"bl:{request.refresh_token}")
        if is_blacklisted:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
            
        access_token = security.create_access_token(subject=user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=request.refresh_token, # Returning same refresh token until it expires
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@router.post("/logout")
async def logout(
    token: str = Depends(reusable_oauth2),
    redis: Redis = Depends(get_redis)
):
    if token:
        # Add access token to blocklist in redis
        await redis.setex(f"bl:{token}", settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "true")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserProfile)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    role_name = "customer"
    permissions = []
    if getattr(current_user, 'roles', None) and len(current_user.roles) > 0:
        role_name = current_user.roles[0].role.name
        if current_user.roles[0].role.permissions:
            permissions = [p.permission.name for p in current_user.roles[0].role.permissions]

    return UserProfile(
        id=current_user.id,
        phone=current_user.phone,
        full_name=current_user.full_name,
        city=current_user.city,
        role=role_name,
        permissions=permissions,
        created_at=current_user.created_at
    )
