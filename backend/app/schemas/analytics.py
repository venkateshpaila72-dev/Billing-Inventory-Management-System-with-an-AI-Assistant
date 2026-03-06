from pydantic import BaseModel
from typing import List


class RevenueResponse(BaseModel):
    period: str
    total_revenue: float
    total_gst: float
    grand_total: float
    total_sales: int


class TopProductResponse(BaseModel):
    product_id: int
    product_name: str
    total_quantity_sold: int
    total_revenue: float


class TopStaffResponse(BaseModel):
    staff_id: int
    staff_name: str
    total_sales: int
    total_revenue: float


class ProfitResponse(BaseModel):
    period: str
    total_profit: float
    total_revenue: float
    total_cost: float


class DashboardResponse(BaseModel):
    today_revenue: float
    today_sales: int
    today_profit: float
    total_products: int
    low_stock_count: int
    total_staff: int
    unread_notifications: int