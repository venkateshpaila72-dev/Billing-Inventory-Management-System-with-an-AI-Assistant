from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse
from app.crud.product import (
    get_all_products,
    get_product_by_id,
    get_products_by_category,
    create_product,
    update_product,
    delete_product
)
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductDetailResponse])
def list_products(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if category_id:
        return get_products_by_category(db, category_id)
    return get_all_products(db)


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("", response_model=ProductResponse)
def add_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return create_product(
        db,
        data.name,
        data.category_id,
        data.supplier_id,
        data.selling_price,
        data.cost_price,
        data.stock_qty,
        data.low_stock_threshold
    )


@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    product = update_product(
        db,
        product_id,
        data.name,
        data.category_id,
        data.supplier_id,
        data.selling_price,
        data.cost_price,
        data.low_stock_threshold
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.delete("/{product_id}")
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return {"message": "Product deleted successfully"}