from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.inventory import Product
from app.models.payment import Payment, PaymentStatus
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only allow admins/staff
    # In a real app we would use RBAC middleware here
    
    # 1. Total Revenue (Completed Orders / Successful Payments)
    revenue_query = select(func.sum(Payment.amount)).where(Payment.status == PaymentStatus.SUCCESS)
    revenue_result = await db.execute(revenue_query)
    total_revenue = revenue_result.scalar() or 0.0
    
    # 2. Total Orders
    orders_query = select(func.count(Order.id))
    orders_result = await db.execute(orders_query)
    total_orders = orders_result.scalar() or 0
    
    # 3. Active Products
    products_query = select(func.count(Product.id)).where(Product.is_active == True)
    products_result = await db.execute(products_query)
    active_products = products_result.scalar() or 0
    
    # 4. Total Users
    users_query = select(func.count(User.id)).where(User.is_active == True)
    users_result = await db.execute(users_query)
    total_users = users_result.scalar() or 0

    # Recent Orders
    recent_orders_query = select(Order).order_by(Order.created_at.desc()).limit(5)
    recent_orders_result = await db.execute(recent_orders_query)
    recent_orders = recent_orders_result.scalars().all()

    return {
        "metrics": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "active_products": active_products,
            "total_users": total_users,
        },
        "recent_orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "status": o.status,
                "total_amount": o.final_amount,
                "date": o.created_at.isoformat()
            } for o in recent_orders
        ]
    }
