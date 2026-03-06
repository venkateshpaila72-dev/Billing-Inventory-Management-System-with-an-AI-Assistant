from sqlalchemy.orm import Session
from app.models.notification import Notification
from typing import Optional


def get_all_notifications(db: Session) -> list[Notification]:
    return db.query(Notification).order_by(
        Notification.created_at.desc()
    ).all()


def get_unread_notifications(db: Session) -> list[Notification]:
    return db.query(Notification).filter(
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).all()


def get_unread_notification_for_product(
    db: Session, product_id: int
) -> Optional[Notification]:
    return db.query(Notification).filter(
        Notification.product_id == product_id,
        Notification.is_read == False
    ).first()


def create_notification(
    db: Session,
    product_id: int,
    message: str
) -> Notification:
    notification = Notification(
        product_id=product_id,
        message=message,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def mark_as_read(db: Session, notification_id: int) -> Optional[Notification]:
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()
    if not notification:
        return None
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_read(db: Session) -> None:
    db.query(Notification).filter(
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()


def get_unread_count(db: Session) -> int:
    return db.query(Notification).filter(
        Notification.is_read == False
    ).count()