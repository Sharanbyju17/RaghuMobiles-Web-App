import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.inventory import Category, Brand, Product

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

mock_products = [
  {
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "storage": "256 GB",
    "color": "Deep Purple",
    "price": 68999,
    "condition": "Like New",
    "batteryHealth": 96,
    "warrantyMonths": 6,
    "imei": "356789102345671",
    "stock": 3,
    "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    "brand": "Apple",
    "model": "iPhone 13",
    "storage": "128 GB",
    "color": "Midnight",
    "price": 42999,
    "condition": "Excellent",
    "batteryHealth": 92,
    "warrantyMonths": 6,
    "imei": "356789102345672",
    "stock": 5,
    "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    "brand": "Samsung",
    "model": "Galaxy S23 Ultra",
    "storage": "256 GB",
    "color": "Phantom Black",
    "price": 62999,
    "condition": "Like New",
    "batteryHealth": 98,
    "warrantyMonths": 6,
    "imei": "356789102345673",
    "stock": 2,
    "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=80",
  },
  {
    "brand": "OnePlus",
    "model": "OnePlus 11",
    "storage": "256 GB",
    "color": "Titan Black",
    "price": 38999,
    "condition": "Excellent",
    "batteryHealth": 94,
    "warrantyMonths": 3,
    "imei": "356789102345674",
    "stock": 0,
    "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
  }
]

async def seed():
    async with async_session() as session:
        # Create Brands
        brands_map = {}
        for b in ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi"]:
            brand = Brand(name=b)
            session.add(brand)
            brands_map[b] = brand
        
        category = Category(name="Smartphones")
        session.add(category)
        
        await session.flush()
        
        # Create products
        for p in mock_products:
            prod = Product(
                title=p["model"],
                sku=p["imei"],
                condition=p["condition"],
                price=p["price"],
                stock_quantity=p["stock"],
                brand_id=brands_map[p["brand"]].id,
                category_id=category.id,
                images=[p["image"]],
                specifications={
                    "storage": p["storage"],
                    "color": p["color"],
                    "batteryHealth": p["batteryHealth"],
                    "warrantyMonths": p["warrantyMonths"]
                }
            )
            session.add(prod)
            
        await session.commit()
        print("Database seeded with mock products!")

if __name__ == "__main__":
    asyncio.run(seed())
