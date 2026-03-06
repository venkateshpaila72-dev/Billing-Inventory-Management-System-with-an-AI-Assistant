from sqlalchemy.orm import Session, joinedload
from app.models.sale import Sale
from typing import Optional
import uuid


def generate_bill_number() -> str:
    return "BILL-" + str(uuid.uuid4())[:8].upper()


def create_sale(
    db: Session,
    staff_id: int,
    customer_id: Optional[int],
    total: float,
    gst_amount: float,
    grand_total: float
) -> Sale:
    sale = Sale(
        bill_number=generate_bill_number(),
        staff_id=staff_id,
        customer_id=customer_id,
        total=total,
        gst_amount=gst_amount,
        grand_total=grand_total
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


def get_all_sales(db: Session) -> list[Sale]:
    return db.query(Sale).options(
        joinedload(Sale.items),
        joinedload(Sale.customer)
    ).order_by(Sale.created_at.desc()).all()


def get_sales_by_staff(db: Session, staff_id: int) -> list[Sale]:
    return db.query(Sale).options(
        joinedload(Sale.items),
        joinedload(Sale.customer)
    ).filter(Sale.staff_id == staff_id).order_by(Sale.created_at.desc()).all()


def get_sale_by_id(db: Session, sale_id: int) -> Optional[Sale]:
    return db.query(Sale).options(
        joinedload(Sale.items),
        joinedload(Sale.customer)
    ).filter(Sale.id == sale_id).first()


def get_sale_by_bill_number(db: Session, bill_number: str) -> Optional[Sale]:
    return db.query(Sale).filter(Sale.bill_number == bill_number).first()