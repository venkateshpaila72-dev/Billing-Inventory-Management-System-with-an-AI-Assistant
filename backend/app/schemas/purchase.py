from pydantic import BaseModel
from datetime import datetime


class PurchaseCreate(BaseModel):
    product_id: int
    supplier_id: int
    quantity: int
    cost_price: float


class PurchaseResponse(BaseModel):
    id: int
    product_id: int
    supplier_id: int
    quantity: int
    cost_price: float
    total_cost: float
    purchased_at: datetime
    added_by: int

    class Config:
        from_attributes = True