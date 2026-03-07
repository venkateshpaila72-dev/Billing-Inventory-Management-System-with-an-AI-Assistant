from sqlalchemy.orm import Session
from app.models.password_reset_request import PasswordResetRequest
from app.models.user import User
from typing import Optional


def create_reset_request(db: Session, staff_id: int, reason: Optional[str]) -> PasswordResetRequest:
    req = PasswordResetRequest(staff_id=staff_id, reason=reason)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def get_all_reset_requests(db: Session) -> list[PasswordResetRequest]:
    return db.query(PasswordResetRequest).order_by(
        PasswordResetRequest.created_at.desc()
    ).all()


def get_pending_reset_requests(db: Session) -> list[PasswordResetRequest]:
    return db.query(PasswordResetRequest).filter(
        PasswordResetRequest.is_resolved == False
    ).order_by(PasswordResetRequest.created_at.desc()).all()


def resolve_reset_request(db: Session, request_id: int) -> Optional[PasswordResetRequest]:
    req = db.query(PasswordResetRequest).filter(PasswordResetRequest.id == request_id).first()
    if not req:
        return None
    req.is_resolved = True
    db.commit()
    db.refresh(req)
    return req