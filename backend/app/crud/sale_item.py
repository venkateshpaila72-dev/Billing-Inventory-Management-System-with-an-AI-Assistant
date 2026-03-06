from sqlalchemy.orm import Session
from app.models.sale_item import SaleItem


def create_sale_item(
    db: Session,
    sale_id: int,
    product_id: int,
    quantity: int,
    unit_price: float,
    cost_price_snapshot: float,
    gst_rate: float,
    profit: float
) -> SaleItem:
    item = SaleItem(
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
        cost_price_snapshot=cost_price_snapshot,
        gst_rate=gst_rate,
        profit=profit
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_items_by_sale(db: Session, sale_id: int) -> list[SaleItem]:
    return db.query(SaleItem).filter(SaleItem.sale_id == sale_id).all()