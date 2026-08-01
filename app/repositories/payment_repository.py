from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate

class PaymentRepository(BaseRepository[Payment, PaymentCreate, PaymentUpdate]):
    async def get_by_transaction_id(self, db: AsyncSession, *, transaction_id: str) -> Optional[Payment]:
        query = select(Payment).where(Payment.transaction_id == transaction_id, Payment.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_order_id(self, db: AsyncSession, *, order_id: Any) -> List[Payment]:
        query = select(Payment).where(Payment.order_id == order_id, Payment.is_active == True)
        result = await db.execute(query)
        return list(result.scalars().all())

payment_repo = PaymentRepository(Payment)
