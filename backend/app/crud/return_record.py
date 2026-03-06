from sqlalchemy.orm import Session
from app.models.return_record import ReturnRecord
from typing import Optional


def create_return(
    db: Session,
    sale_id: int,
    product_id: int,
    quantity: int,
    refund_amount: float,
    reason: Optional[str],
    processed_by: int
) -> ReturnRecord:
    return_record = ReturnRecord(
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        refund_amount=refund_amount,
        reason=reason,
        processed_by=processed_by
    )
    db.add(return_record)
    db.commit()
    db.refresh(return_record)
    return return_record


def get_all_returns(db: Session) -> list[ReturnRecord]:
    return db.query(ReturnRecord).order_by(
        ReturnRecord.returned_at.desc()
    ).all()


def get_return_by_id(db: Session, return_id: int) -> Optional[ReturnRecord]:
    return db.query(ReturnRecord).filter(
        ReturnRecord.id == return_id
    ).first()


def get_returns_by_sale(db: Session, sale_id: int) -> list[ReturnRecord]:
    return db.query(ReturnRecord).filter(
        ReturnRecord.sale_id == sale_id
    ).all()