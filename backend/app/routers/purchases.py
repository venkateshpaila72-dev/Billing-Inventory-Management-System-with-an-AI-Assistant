from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.schemas.purchase import PurchaseCreate, PurchaseResponse
from app.services.purchase_service import record_purchase
from app.crud.purchase import get_all_purchases
from app.models.user import User

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.post("", response_model=PurchaseResponse)
def add_purchase(
    data: PurchaseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return record_purchase(
        db,
        data.product_id,
        data.supplier_id,
        data.quantity,
        data.cost_price,
        admin.id
    )


@router.get("", response_model=list[PurchaseResponse])
def list_purchases(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_purchases(db)