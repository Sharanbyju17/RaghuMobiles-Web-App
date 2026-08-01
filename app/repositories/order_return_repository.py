from typing import Optional, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.order_return import OrderReturn
from app.schemas.order_return import OrderReturnCreate, OrderReturnUpdate

class OrderReturnRepository(BaseRepository[OrderReturn, OrderReturnCreate, OrderReturnUpdate]):
    async def get_by_customer_id(self, db: AsyncSession, *, customer_id: Any) -> List[OrderReturn]:
        query = select(OrderReturn).where(OrderReturn.customer_id == customer_id, OrderReturn.is_active == True)
        result = await db.execute(query)
        return list(result.scalars().all())
        
    async def get_by_order_id(self, db: AsyncSession, *, order_id: Any) -> List[OrderReturn]:
        query = select(OrderReturn).where(OrderReturn.order_id == order_id, OrderReturn.is_active == True)
        result = await db.execute(query)
        return list(result.scalars().all())

order_return_repo = OrderReturnRepository(OrderReturn)
