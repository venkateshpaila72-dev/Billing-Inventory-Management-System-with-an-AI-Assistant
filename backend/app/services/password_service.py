from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import verify_password
from app.crud.user import update_password
from app.models.user import User


def change_password(db: Session, user: User, old_password: str, new_password: str) -> dict:
    # Verify old password is correct
    if not verify_password(old_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password is incorrect"
        )

    # New password must be different
    if old_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from old password"
        )

    # New password minimum length check
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters"
        )

    update_password(db, user, new_password)
    return {"message": "Password changed successfully"}