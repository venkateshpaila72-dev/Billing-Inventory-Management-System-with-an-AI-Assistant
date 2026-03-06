from sqlalchemy.orm import Session, joinedload
from app.models.purchase import Purchase
from typing import Optional


def create_purchase(
    db: Session,
    product_id: int,
    supplier_id: int,
    quantity: int,
    cost_price: float,
    total_cost: float,
    added_by: int
) -> Purchase:
    purchase = Purchase(
        product_id=product_id,
        supplier_id=supplier_id,
        quantity=quantity,
        cost_price=cost_price,
        total_cost=total_cost,
        added_by=added_by
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase


def get_all_purchases(db: Session) -> list[Purchase]:
    return db.query(Purchase).options(
        joinedload(Purchase.product),
        joinedload(Purchase.supplier)
    ).order_by(Purchase.purchased_at.desc()).all()


def get_purchase_by_id(db: Session, purchase_id: int) -> Optional[Purchase]:
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()