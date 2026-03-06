from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    category_id: int
    supplier_id: int
    selling_price: float
    cost_price: float
    stock_qty: int = 0
    low_stock_threshold: int = 10


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    selling_price: Optional[float] = None
    cost_price: Optional[float] = None
    low_stock_threshold: Optional[int] = None


class CategoryInProduct(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class SupplierInProduct(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    name: str
    category_id: int
    supplier_id: int
    selling_price: float
    cost_price: float
    stock_qty: int
    low_stock_threshold: int

    class Config:
        from_attributes = True


class ProductDetailResponse(BaseModel):
    id: int
    name: str
    selling_price: float
    cost_price: float
    stock_qty: int
    low_stock_threshold: int
    category: Optional[CategoryInProduct] = None
    supplier: Optional[SupplierInProduct] = None

    class Config:
        from_attributes = True