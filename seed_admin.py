import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.core.config import settings
from app.models.user import User
from app.models.role import Role, UserRole

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_admin():
    async with async_session() as session:
        # Create roles if not exist
        admin_role = await session.execute(select(Role).where(Role.name == "admin"))
        admin_role = admin_role.scalars().first()
        if not admin_role:
            admin_role = Role(name="admin", description="System Administrator")
            session.add(admin_role)
            await session.flush()
            
        # Create an admin user
        phone = "9876543210"
        user = await session.execute(select(User).where(User.phone == phone))
        user = user.scalars().first()
        if not user:
            user = User(phone=phone, full_name="System Admin", city="Admin City")
            session.add(user)
            await session.flush()
            
        # Assign role
        user_role = await session.execute(select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == admin_role.id))
        if not user_role.scalars().first():
            ur = UserRole(user_id=user.id, role_id=admin_role.id)
            session.add(ur)
            
        await session.commit()
        print("Admin user seeded! Phone: 9876543210, OTP: 123456")

if __name__ == "__main__":
    asyncio.run(seed_admin())
