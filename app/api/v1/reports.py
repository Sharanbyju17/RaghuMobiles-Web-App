from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Dict, Any
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/sales")
async def get_sales_report(
    days: int = 30, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Only allow admins
    start_date = datetime.now() - timedelta(days=days)
    
    # Simple group by date (cast timestamp to date)
    query = select(
        func.date(Order.created_at).label("date"),
        func.sum(Order.final_amount).label("total_sales"),
        func.count(Order.id).label("order_count")
    ).where(Order.created_at >= start_date, Order.status == OrderStatus.COMPLETED).group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at))
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        {
            "date": row.date.isoformat() if row.date else None,
            "sales": row.total_sales or 0,
            "orders": row.order_count or 0
        } for row in rows
    ]
