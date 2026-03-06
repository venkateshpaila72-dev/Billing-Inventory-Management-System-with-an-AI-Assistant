from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    id: int
    product_id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True