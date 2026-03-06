from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.schemas.sale import SaleCreate, SaleResponse, SaleListResponse
from app.services.billing_service import process_bill
from app.crud.sale import get_all_sales, get_sales_by_staff, get_sale_by_id
from app.models.user import User, UserRole

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("", response_model=SaleResponse)
def create_bill(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Both admin and staff can create bills
    # But staff_id is always the logged in user
    return process_bill(db, data, current_user.id)


@router.get("", response_model=list[SaleListResponse])
def list_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admin sees all sales, staff sees only their own
    if current_user.role == UserRole.admin:
        return get_all_sales(db)
    return get_sales_by_staff(db, current_user.id)


@router.get("/my", response_model=list[SaleListResponse])
def my_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Staff can explicitly get their own sales
    return get_sales_by_staff(db, current_user.id)


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = get_sale_by_id(db, sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )

    # Staff can only view their own sales
    if current_user.role == UserRole.staff and sale.staff_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own sales"
        )

    return sale