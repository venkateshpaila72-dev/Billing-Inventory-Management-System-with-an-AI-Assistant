from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.schemas.notification import NotificationResponse
from app.crud.notification import (
    get_all_notifications,
    get_unread_notifications,
    mark_as_read,
    mark_all_as_read,
    get_unread_count
)
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    if unread_only:
        return get_unread_notifications(db)
    return get_all_notifications(db)


@router.get("/count")
def unread_count(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    count = get_unread_count(db)
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    notification = mark_as_read(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification


@router.patch("/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    mark_all_as_read(db)
    return {"message": "All notifications marked as read"}