from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.schemas.return_record import ReturnCreate, ReturnResponse
from app.services.return_service import process_return
from app.crud.return_record import get_all_returns, get_returns_by_sale
from app.models.user import User

router = APIRouter(prefix="/returns", tags=["Returns"])


@router.post("", response_model=ReturnResponse)
def handle_return(
    data: ReturnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return process_return(
        db,
        data.sale_id,
        data.product_id,
        data.quantity,
        data.reason,
        current_user.id
    )


@router.get("", response_model=list[ReturnResponse])
def list_returns(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_returns(db)


@router.get("/sale/{sale_id}", response_model=list[ReturnResponse])
def returns_by_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_returns_by_sale(db, sale_id)