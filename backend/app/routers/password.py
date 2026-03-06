from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.password import PasswordChangeRequest
from app.services.password_service import change_password
from app.models.user import User

router = APIRouter(prefix="/password", tags=["Password"])


@router.post("/change")
def change_my_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return change_password(db, current_user, data.old_password, data.new_password)