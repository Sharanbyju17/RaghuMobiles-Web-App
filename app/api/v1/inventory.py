from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException, ConflictException
from app.schemas.inventory import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    BrandCreate, BrandUpdate, BrandResponse,
    ProductCreate, ProductUpdate, ProductResponse
)
from app.repositories.inventory_repository import category_repo, brand_repo, product_repo
from app.services.media_service import media_service
import openpyxl
from io import BytesIO

router = APIRouter()

# --- Categories ---
@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = await category_repo.get_by_name(db, name=category_in.name)
    if existing:
        raise ConflictException("Category already exists")
    return await category_repo.create(db, obj_in=category_in)

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await category_repo.get_all(db, skip=skip, limit=limit)

@router.delete("/categories/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    cat = await category_repo.get(db, id=id)
    if not cat:
        raise NotFoundException("Category not found")
    await category_repo.remove(db, id=id)
    return None

# --- Brands ---
@router.post("/brands", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand_in: BrandCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = await brand_repo.get_by_name(db, name=brand_in.name)
    if existing:
        raise ConflictException("Brand already exists")
    return await brand_repo.create(db, obj_in=brand_in)

@router.get("/brands", response_model=List[BrandResponse])
async def get_brands(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await brand_repo.get_all(db, skip=skip, limit=limit)

# --- Products ---
@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = await product_repo.get_by_sku(db, sku=product_in.sku)
    if existing:
        raise ConflictException("Product with this SKU already exists")
    
    # Auto-resolve brand_id from specifications.brand_name if brand_id not provided
    specs = product_in.specifications or {}
    brand_id = product_in.brand_id
    if not brand_id and specs.get("brand_name"):
        brand_name = str(specs["brand_name"]).strip()
        b = await brand_repo.get_by_name(db, name=brand_name)
        if not b:
            b = await brand_repo.create(db, obj_in=BrandCreate(name=brand_name))
        brand_id = b.id

    # Auto-resolve category_id from specifications.category_name if category_id not provided
    category_id = product_in.category_id
    if not category_id and specs.get("category_name"):
        cat_name = str(specs["category_name"]).strip()
        c = await category_repo.get_by_name(db, name=cat_name)
        if not c:
            c = await category_repo.create(db, obj_in=CategoryCreate(name=cat_name))
        category_id = c.id

    # Build final product with resolved IDs
    from app.schemas.inventory import ProductCreate as PC
    resolved = PC(
        title=product_in.title,
        sku=product_in.sku,
        description=product_in.description,
        condition=product_in.condition,
        specifications=product_in.specifications,
        price=product_in.price,
        stock_quantity=product_in.stock_quantity,
        images=product_in.images,
        category_id=category_id,
        brand_id=brand_id,
    )
    # Include videos if present in the model schema (we added it in previous step)
    if hasattr(product_in, 'videos'):
        resolved.videos = product_in.videos

    product = await product_repo.create(db, obj_in=resolved)
    return await product_repo.get(db, id=product.id)

@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await product_repo.get_all(db, skip=skip, limit=limit)

@router.get("/products/{id}", response_model=ProductResponse)
async def get_product(
    id: UUID, db: AsyncSession = Depends(get_db)
):
    product = await product_repo.get(db, id=id)
    if not product:
        raise NotFoundException("Product not found")
    return product

@router.put("/products/{id}", response_model=ProductResponse)
async def update_product(
    id: UUID,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = await product_repo.get(db, id=id)
    if not product:
        raise NotFoundException("Product not found")
        
    if product_in.sku and product_in.sku != product.sku:
        existing = await product_repo.get_by_sku(db, sku=product_in.sku)
        if existing and existing.id != id:
            raise ConflictException("Product with this SKU already exists")
            
    # Auto-resolve brand_id and category_id from specifications during update if needed
    specs = product_in.specifications or {}
    brand_id = product_in.brand_id
    if not brand_id and specs.get("brand_name"):
        brand_name = str(specs["brand_name"]).strip()
        b = await brand_repo.get_by_name(db, name=brand_name)
        if not b:
            b = await brand_repo.create(db, obj_in=BrandCreate(name=brand_name))
        product_in.brand_id = b.id

    category_id = product_in.category_id
    if not category_id and specs.get("category_name"):
        cat_name = str(specs["category_name"]).strip()
        c = await category_repo.get_by_name(db, name=cat_name)
        if not c:
            c = await category_repo.create(db, obj_in=CategoryCreate(name=cat_name))
        product_in.category_id = c.id

    updated = await product_repo.update(db, db_obj=product, obj_in=product_in)
    return await product_repo.get(db, id=updated.id)

@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    product = await product_repo.get(db, id=id)
    if not product:
        raise NotFoundException("Product not found")
    await product_repo.remove(db, id=id)
    return None

# --- Uploads ---
@router.post("/upload-media", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload media to R2. Falls back to a placeholder URL if R2 is not configured."""
    try:
        url = await media_service.upload_file(file)
        return {"url": url}
    except Exception as e:
        # If R2 is not configured, return a placeholder
        print(f"[DEV] Media upload failed (R2 not configured?): {e}")
        placeholder = f"https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=80"
        return {"url": placeholder}

@router.get("/media/{filename}", status_code=status.HTTP_307_TEMPORARY_REDIRECT)
async def get_media_url(filename: str):
    from app.services.media_service import media_service
    from fastapi.responses import RedirectResponse
    # Generate presigned URL and redirect the client to it
    url = media_service.get_presigned_url(filename)
    return RedirectResponse(url=url)

@router.post("/bulk-upload", status_code=status.HTTP_201_CREATED)
async def bulk_upload_products(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files are supported")
        
    try:
        content = await file.read()
        wb = openpyxl.load_workbook(filename=BytesIO(content), data_only=True)
        sheet = wb.active
        
        headers = [cell.value for cell in sheet[1]]
        
        products_created = 0
        
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]:
                continue
                
            row_data = dict(zip(headers, row))
            
            brand_name = row_data.get("Brand")
            brand_id = None
            if brand_name:
                b = await brand_repo.get_by_name(db, name=str(brand_name))
                if not b:
                    b = await brand_repo.create(db, obj_in=BrandCreate(name=str(brand_name)))
                brand_id = b.id
                
            cat_name = row_data.get("Category")
            cat_id = None
            if cat_name:
                c = await category_repo.get_by_name(db, name=str(cat_name))
                if not c:
                    c = await category_repo.create(db, obj_in=CategoryCreate(name=str(cat_name)))
                cat_id = c.id
            
            sku = str(row_data.get("SKU") or "")
            existing = await product_repo.get_by_sku(db, sku=sku)
            if existing:
                continue
                
            prod_in = ProductCreate(
                title=str(row_data.get("Title")),
                sku=sku,
                condition=str(row_data.get("Condition") or "Excellent"),
                price=float(row_data.get("Price") or 0.0),
                stock_quantity=int(row_data.get("Stock") or 0),
                category_id=cat_id,
                brand_id=brand_id,
                description=str(row_data.get("Description") or "")
            )
            
            await product_repo.create(db, obj_in=prod_in)
            products_created += 1
            
        return {"message": f"Successfully created {products_created} products"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
