from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
import jwt
from pydantic import ValidationError

from app.database.session import get_db, get_redis
from app.core.config import settings
from app.core import security
from app.core.exceptions import UnauthorizedException
from app.models.user import User
from app.repositories.user_repository import user_repo

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login", # Not strictly used with OTP but required for Swagger UI
    auto_error=False
)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    token: str = Depends(reusable_oauth2)
) -> User:
    if not token:
        raise UnauthorizedException("Not authenticated")
    
    # Check if token is blacklisted in Redis
    is_blacklisted = await redis.get(f"bl:{token}")
    if is_blacklisted:
        raise UnauthorizedException("Token has been revoked")

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Invalid token payload")
    except (jwt.PyJWTError, ValidationError):
        raise UnauthorizedException("Could not validate credentials")
        
    user = await user_repo.get(db, id=user_id)
    if not user:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("Inactive user")
        
    return user

# We re-export get_db and get_redis here so that routers can import from core.dependencies
__all__ = ["get_db", "get_redis", "get_current_user"]
