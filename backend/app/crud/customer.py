from sqlalchemy.orm import Session
from app.models.customer import Customer
from typing import Optional


def get_customer_by_phone(db: Session, phone: str) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.phone == phone).first()


def get_customer_by_id(db: Session, customer_id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.id == customer_id).first()


def create_customer(
    db: Session,
    phone: str,
    age: Optional[int],
    gender: Optional[str]
) -> Customer:
    customer = Customer(phone=phone, age=age, gender=gender)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_or_create_customer(
    db: Session,
    phone: str,
    age: Optional[int],
    gender: Optional[str]
) -> Customer:
    customer = get_customer_by_phone(db, phone)
    if customer:
        # Update age and gender if provided
        if age is not None:
            customer.age = age
        if gender is not None:
            customer.gender = gender
        db.commit()
        db.refresh(customer)
        return customer
    return create_customer(db, phone, age, gender)