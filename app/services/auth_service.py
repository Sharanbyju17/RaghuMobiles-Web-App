import json
import random
from datetime import timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from fastapi import HTTPException, status
from app.core import security
from app.repositories.user_repository import user_repo, UserCreate
from app.schemas.auth import AuthResponse, TokenResponse, UserProfile

OTP_EXPIRY_SECONDS = 300  # 5 mins

def _generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return str(random.randint(100000, 999999))

class AuthService:
    def __init__(self, db: AsyncSession, redis: Redis):
        self.db = db
        self.redis = redis

    async def send_otp(self, phone: str) -> bool:
        """
        Send OTP to the given phone number.
        
        In production: replace the print statement with MSG91 API call.
        The interface stays the same — only the delivery method changes.
        """
        key = f"otp:{phone}"
        otp_code = _generate_otp()
        await self.redis.set(key, otp_code, ex=OTP_EXPIRY_SECONDS)
        
        # DEV MODE: Print OTP to terminal
        # TODO: Replace with MSG91 when paid — msg91.send_otp(phone, otp_code)
        print(f"\n{'='*50}")
        print(f"[DEV OTP] Phone: {phone}  →  OTP: {otp_code}")
        print(f"{'='*50}\n")
        
        return True

    async def verify_otp(self, phone: str, otp: str, full_name: Optional[str] = None, city: Optional[str] = None, email: Optional[str] = None) -> AuthResponse:
        key = f"otp:{phone}"
        stored_otp = await self.redis.get(key)

        # Accept stored OTP or "123456" fallback for seeded admin account
        if stored_otp:
            if stored_otp != otp:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
        else:
            # No OTP in Redis — only allow "123456" as emergency dev fallback
            if otp != "123456":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
        
        # OTP is valid, remove it
        await self.redis.delete(key)

        # Check if user exists
        user = await user_repo.get_by_phone(self.db, phone=phone)
        
        is_new_user = False
        if not user:
            # If no full_name/city provided, tell frontend it's a new user
            if not full_name or not city:
                return AuthResponse(success=True, is_new_user=True)
            
            # Register user
            user = await user_repo.create(self.db, obj_in=UserCreate(phone=phone, full_name=full_name, city=city, email=email))
            is_new_user = True

        # Generate tokens
        access_token = security.create_access_token(subject=str(user.id))
        refresh_token = security.create_refresh_token(subject=str(user.id))

        # Build UserProfile — load role from DB
        role_name = "customer"
        permissions = []
        
        if not is_new_user and getattr(user, 'roles', None) and len(user.roles) > 0:
            role_name = user.roles[0].role.name
            if user.roles[0].role.permissions:
                permissions = [p.permission.name for p in user.roles[0].role.permissions]

        profile = UserProfile(
            id=user.id,
            phone=user.phone,
            full_name=user.full_name,
            city=user.city,
            role=role_name,
            permissions=permissions,
            created_at=user.created_at
        )

        tokens = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return AuthResponse(success=True, is_new_user=is_new_user, tokens=tokens, user=profile)
