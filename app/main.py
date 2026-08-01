from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers

# Initialize structured logging before app creation
setup_logging()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # Set all CORS enabled origins
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "version": settings.VERSION}
        
    app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
    
    from app.api.v1 import users, inventory, orders, payments, dashboard, customers, staff, leaves, reviews, returns, reports, notifications, settings as sys_settings, audit_logs, cart, wishlist
    app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
    app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
    app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
    app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
    app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
    app.include_router(customers.router, prefix=f"{settings.API_V1_STR}/customers", tags=["customers"])
    app.include_router(staff.router, prefix=f"{settings.API_V1_STR}/staff", tags=["staff"])
    app.include_router(leaves.router, prefix=f"{settings.API_V1_STR}/leaves", tags=["leaves"])
    app.include_router(reviews.router, prefix=f"{settings.API_V1_STR}/reviews", tags=["reviews"])
    app.include_router(returns.router, prefix=f"{settings.API_V1_STR}/returns", tags=["returns"])
    app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
    app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
    app.include_router(sys_settings.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])
    app.include_router(audit_logs.router, prefix=f"{settings.API_V1_STR}/audit-logs", tags=["audit logs"])
    app.include_router(cart.router, prefix=f"{settings.API_V1_STR}/cart", tags=["cart"])
    app.include_router(wishlist.router, prefix=f"{settings.API_V1_STR}/wishlist", tags=["wishlist"])
    
    from fastapi.staticfiles import StaticFiles
    import os

    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    
    # Mount the uploads directory to serve static files
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

    # Register exception handlers
    setup_exception_handlers(app)

    return app

app = create_app()
