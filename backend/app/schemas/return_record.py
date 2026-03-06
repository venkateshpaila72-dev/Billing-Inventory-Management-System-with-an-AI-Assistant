from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReturnCreate(BaseModel):
    sale_id: int
    product_id: int
    quantity: int
    reason: Optional[str] = None


class ReturnResponse(BaseModel):
    id: int
    sale_id: int
    product_id: int
    quantity: int
    refund_amount: float
    reason: Optional[str]
    processed_by: int
    returned_at: datetime

    class Config:
        from_attributes = True