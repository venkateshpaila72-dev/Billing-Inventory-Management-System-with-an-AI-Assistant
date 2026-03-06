from pydantic import BaseModel


class SupplierCreate(BaseModel):
    name: str
    contact: str | None = None
    email: str | None = None
    address: str | None = None


class SupplierUpdate(BaseModel):
    name: str | None = None
    contact: str | None = None
    email: str | None = None
    address: str | None = None


class SupplierResponse(BaseModel):
    id: int
    name: str
    contact: str | None
    email: str | None
    address: str | None

    class Config:
        from_attributes = True