from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.schemas.customer import CustomerResponse
from app.crud.customer import get_customer_by_id, get_customer_by_phone
from app.models.user import User

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    customer = get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer


@router.get("/phone/{phone}", response_model=CustomerResponse)
def get_customer_by_phone_number(
    phone: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    customer = get_customer_by_phone(db, phone)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer