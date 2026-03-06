from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.sale_item import SaleItemInput, SaleItemResponse
from app.schemas.customer import CustomerCreate, CustomerResponse


class SaleCreate(BaseModel):
    items: List[SaleItemInput]
    customer: Optional[CustomerCreate] = None
    gst_rate: float = 18.0


class SaleItemDetailResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    cost_price_snapshot: float
    gst_rate: float
    profit: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    bill_number: str
    staff_id: int
    customer_id: Optional[int]
    total: float
    gst_amount: float
    grand_total: float
    created_at: datetime
    items: List[SaleItemDetailResponse] = []
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True


class SaleListResponse(BaseModel):
    id: int
    bill_number: str
    staff_id: int
    customer_id: Optional[int]
    total: float
    gst_amount: float
    grand_total: float
    created_at: datetime

    class Config:
        from_attributes = True