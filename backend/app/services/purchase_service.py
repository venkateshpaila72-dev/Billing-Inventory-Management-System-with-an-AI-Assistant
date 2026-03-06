from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.crud.purchase import create_purchase
from app.crud.product import get_product_by_id, update_stock


def record_purchase(
    db: Session,
    product_id: int,
    supplier_id: int,
    quantity: int,
    cost_price: float,
    added_by: int
):
    # Check product exists
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check quantity is valid
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    # Check cost price is valid
    if cost_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cost price must be greater than zero"
        )

    # Calculate total cost
    total_cost = quantity * cost_price

    # Create purchase record
    purchase = create_purchase(
        db, product_id, supplier_id, quantity, cost_price, total_cost, added_by
    )

    # Increase stock
    update_stock(db, product_id, quantity)

    return purchase