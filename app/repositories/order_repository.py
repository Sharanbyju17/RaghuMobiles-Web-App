from typing import Optional, List, Any, Dict, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate
import uuid
import datetime

class OrderRepository(BaseRepository[Order, OrderCreate, OrderUpdate]):
    async def create_with_items(self, db: AsyncSession, *, obj_in: OrderCreate) -> Order:
        # Generate a unique order number like ORD-YYYYMMDD-UUID
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        short_uuid = str(uuid.uuid4())[:6].upper()
        order_number = f"ORD-{date_str}-{short_uuid}"
        
        db_obj = Order(
            user_id=obj_in.user_id,
            order_number=order_number,
            status=obj_in.status,
            order_type=obj_in.order_type,
            total_amount=obj_in.total_amount,
            tax_amount=obj_in.tax_amount,
            discount_amount=obj_in.discount_amount,
            final_amount=obj_in.final_amount,
            handled_by_id=obj_in.handled_by_id
        )
        db.add(db_obj)
        await db.flush() # To get db_obj.id
        
        # Create Order Items
        for item in obj_in.items:
            db_item = OrderItem(
                order_id=db_obj.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal
            )
            db.add(db_item)
            
        await db.commit()
        await db.refresh(db_obj)
        
        # Load relationships to return a fully populated object
        query = select(Order).options(selectinload(Order.items)).where(Order.id == db_obj.id)
        result = await db.execute(query)
        return result.scalars().first()
        
    async def get_by_order_number(self, db: AsyncSession, *, order_number: str) -> Optional[Order]:
        query = select(Order).options(selectinload(Order.items)).where(Order.order_number == order_number, Order.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Order]:
        query = select(Order).options(selectinload(Order.items)).where(Order.is_active == True).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get(self, db: AsyncSession, id: Any) -> Optional[Order]:
        query = select(Order).options(selectinload(Order.items)).where(Order.id == id, Order.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

order_repo = OrderRepository(Order)
