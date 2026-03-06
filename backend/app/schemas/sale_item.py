from pydantic import BaseModel


class SaleItemInput(BaseModel):
    product_id: int
    quantity: int


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    cost_price_snapshot: float
    gst_rate: float
    profit: float

    class Config:
        from_attributes = True