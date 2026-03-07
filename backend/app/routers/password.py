from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.password import (
    PasswordChangeRequest,
    ForgotPasswordRequest,
    AdminResetPasswordRequest,
    PasswordResetRequestResponse,
)
from app.services.password_service import change_password
from app.crud import password_reset as crud_reset
from app.crud.user import get_user_by_email, get_user_by_id, update_password
from app.models.user import User, UserRole


router = APIRouter(prefix="/password", tags=["Password"])


# Staff: change own password
@router.post("/change")
def change_my_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return change_password(db, current_user, data.old_password, data.new_password)


# Staff: submit forgot password request (public — no auth needed)
@router.post("/forgot-request")
def forgot_password_request(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    if user.role != UserRole.staff:
        raise HTTPException(status_code=403, detail="Only staff can request password reset.")

    # Check if there's already a pending request
    pending = crud_reset.get_pending_reset_requests(db)
    already_pending = any(r.staff_id == user.id for r in pending)
    if already_pending:
        raise HTTPException(status_code=400, detail="You already have a pending reset request.")

    crud_reset.create_reset_request(db, staff_id=user.id, reason=data.reason)
    return {"message": "Reset request submitted. Please contact your admin."}


# Admin: get all pending reset requests
@router.get("/reset-requests", response_model=list[PasswordResetRequestResponse])
def get_reset_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only.")
    requests = crud_reset.get_pending_reset_requests(db)
    result = []
    for r in requests:
        result.append(PasswordResetRequestResponse(
            id=r.id,
            staff_id=r.staff_id,
            staff_name=r.staff.name,
            staff_email=r.staff.email,
            reason=r.reason,
            is_resolved=r.is_resolved,
            created_at=r.created_at,
        ))
    return result


# Admin: reset staff password and resolve request
@router.post("/reset-by-admin")
def admin_reset_password(
    data: AdminResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only.")
    staff = get_user_by_id(db, data.staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found.")
    update_password(db, staff, data.new_password)

    # Resolve all pending requests for this staff
    pending = crud_reset.get_pending_reset_requests(db)
    for r in pending:
        if r.staff_id == data.staff_id:
            crud_reset.resolve_reset_request(db, r.id)

    return {"message": f"Password reset successfully for {staff.name}."}