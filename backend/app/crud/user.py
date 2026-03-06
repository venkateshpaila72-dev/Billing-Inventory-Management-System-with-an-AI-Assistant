from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_all_staff(db: Session) -> list[User]:
    return db.query(User).filter(User.role == UserRole.staff).all()


def create_staff(db: Session, name: str, email: str, password: str) -> User:
    staff = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.staff,
        is_active=True
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


def update_staff(db: Session, user_id: int, name: str | None, email: str | None, is_active: bool | None) -> User | None:
    staff = get_user_by_id(db, user_id)
    if not staff or staff.role != UserRole.staff:
        return None
    if name is not None:
        staff.name = name
    if email is not None:
        staff.email = email
    if is_active is not None:
        staff.is_active = is_active
    db.commit()
    db.refresh(staff)
    return staff


def update_password(db: Session, user: User, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
    db.commit()