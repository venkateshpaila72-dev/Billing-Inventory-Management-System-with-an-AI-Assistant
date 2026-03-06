from sqlalchemy.orm import Session
from app.models.supplier import Supplier
from typing import Optional


def get_all_suppliers(db: Session) -> list[Supplier]:
    return db.query(Supplier).all()


def get_supplier_by_id(db: Session, supplier_id: int) -> Optional[Supplier]:
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()


def create_supplier(
    db: Session,
    name: str,
    contact: Optional[str],
    email: Optional[str],
    address: Optional[str]
) -> Supplier:
    supplier = Supplier(
        name=name,
        contact=contact,
        email=email,
        address=address
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def update_supplier(
    db: Session,
    supplier_id: int,
    name: Optional[str],
    contact: Optional[str],
    email: Optional[str],
    address: Optional[str]
) -> Optional[Supplier]:
    supplier = get_supplier_by_id(db, supplier_id)
    if not supplier:
        return None
    if name is not None:
        supplier.name = name
    if contact is not None:
        supplier.contact = contact
    if email is not None:
        supplier.email = email
    if address is not None:
        supplier.address = address
    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier_id: int) -> bool:
    supplier = get_supplier_by_id(db, supplier_id)
    if not supplier:
        return False
    db.delete(supplier)
    db.commit()
    return True