from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.core.security import hash_password
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.crud.user import (
    get_all_staff,
    get_user_by_id,
    create_staff,
    update_staff,
    get_user_by_email
)
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Staff Management"])


@router.post("", response_model=UserResponse)
def add_staff(
    data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_staff(db, data.name, data.email, data.password)


@router.get("", response_model=list[UserResponse])
def list_staff(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_staff(db)


@router.get("/{user_id}", response_model=UserResponse)
def get_staff(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    staff = get_user_by_id(db, user_id)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    return staff


@router.put("/{user_id}", response_model=UserResponse)
def edit_staff(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    staff = update_staff(db, user_id, data.name, data.email, data.is_active)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    return staff


@router.patch("/{user_id}/toggle-status", response_model=UserResponse)
def toggle_staff_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    staff = get_user_by_id(db, user_id)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    staff.is_active = not staff.is_active
    db.commit()
    db.refresh(staff)
    return staff


@router.patch("/{user_id}/reset-password")
def reset_staff_password(
    user_id: int,
    data: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    staff = get_user_by_id(db, user_id)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    new_password = data.get("new_password")
    if not new_password or len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    staff.password_hash = hash_password(new_password)
    db.commit()
    return {"message": "Password reset successfully"}