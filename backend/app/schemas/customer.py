from pydantic import BaseModel
from typing import Optional


class CustomerCreate(BaseModel):
    phone: str
    age: Optional[int] = None
    gender: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    phone: str
    age: Optional[int]
    gender: Optional[str]

    class Config:
        from_attributes = True