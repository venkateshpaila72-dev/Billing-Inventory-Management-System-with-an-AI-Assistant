from sqlalchemy.orm import Session, joinedload
from app.models.product import Product
from typing import Optional


def get_all_products(db: Session) -> list[Product]:
    return db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.supplier)
    ).all()


def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.supplier)
    ).filter(Product.id == product_id).first()


def get_products_by_category(db: Session, category_id: int) -> list[Product]:
    return db.query(Product).filter(Product.category_id == category_id).all()


def create_product(
    db: Session,
    name: str,
    category_id: int,
    supplier_id: int,
    selling_price: float,
    cost_price: float,
    stock_qty: int,
    low_stock_threshold: int
) -> Product:
    product = Product(
        name=name,
        category_id=category_id,
        supplier_id=supplier_id,
        selling_price=selling_price,
        cost_price=cost_price,
        stock_qty=stock_qty,
        low_stock_threshold=low_stock_threshold
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(
    db: Session,
    product_id: int,
    name: Optional[str],
    category_id: Optional[int],
    supplier_id: Optional[int],
    selling_price: Optional[float],
    cost_price: Optional[float],
    low_stock_threshold: Optional[int]
) -> Optional[Product]:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    if name is not None:
        product.name = name
    if category_id is not None:
        product.category_id = category_id
    if supplier_id is not None:
        product.supplier_id = supplier_id
    if selling_price is not None:
        product.selling_price = selling_price
    if cost_price is not None:
        product.cost_price = cost_price
    if low_stock_threshold is not None:
        product.low_stock_threshold = low_stock_threshold
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> bool:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True


def update_stock(db: Session, product_id: int, quantity_change: int) -> Optional[Product]:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    product.stock_qty += quantity_change
    db.commit()
    db.refresh(product)
    return product