from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.crud.user import get_user_by_email
from app.core.security import verify_password, create_access_token
from app.models.user import UserRole


def login_user(db: Session, email: str, password: str) -> dict:
    # Check user exists
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check password
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact admin."
        )

    # Build token payload
    token_data = {
        "user_id": user.id,
        "role": user.role.value,
        "staff_id": user.id if user.role == UserRole.staff else None
    }

    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": user.id,
        "staff_id": user.id if user.role == UserRole.staff else None,
        "name": user.name
    }