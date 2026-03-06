from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.crud.sale import get_sale_by_id
from app.crud.sale_item import get_items_by_sale
from app.crud.product import get_product_by_id, update_stock
from app.crud.return_record import create_return, get_returns_by_sale
from app.services.notification_service import check_and_notify


def process_return(
    db: Session,
    sale_id: int,
    product_id: int,
    quantity: int,
    reason: str,
    processed_by: int
):
    # Check sale exists
    sale = get_sale_by_id(db, sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )

    # Check product exists
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check product was actually in this sale
    sale_items = get_items_by_sale(db, sale_id)
    sale_item = next(
        (item for item in sale_items if item.product_id == product_id),
        None
    )
    if not sale_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This product was not part of the specified sale"
        )

    # Check quantity is valid
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return quantity must be greater than zero"
        )

    # Check return quantity does not exceed original sold quantity
    already_returned = sum(
        r.quantity for r in get_returns_by_sale(db, sale_id)
        if r.product_id == product_id
    )
    returnable = sale_item.quantity - already_returned
    if quantity > returnable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot return {quantity} units. Only {returnable} units returnable."
        )

    # Calculate refund using original unit price from that sale
    refund_amount = round(sale_item.unit_price * quantity, 2)
    gst_on_refund = round(refund_amount * sale_item.gst_rate / 100, 2)
    refund_with_gst = round(refund_amount + gst_on_refund, 2)

    # Calculate profit to reverse
    profit_to_reverse = round(
        (sale_item.unit_price - sale_item.cost_price_snapshot) * quantity, 2
    )

    # Create return record
    return_record = create_return(
        db, sale_id, product_id, quantity,
        refund_amount, reason, processed_by
    )

    # Restore stock
    updated_product = update_stock(db, product_id, quantity)

    # Update the sale totals — directly affects the staff sale record
    sale.total = round(sale.total - refund_amount, 2)
    sale.gst_amount = round(sale.gst_amount - gst_on_refund, 2)
    sale.grand_total = round(sale.grand_total - refund_with_gst, 2)
    db.commit()

    # Reverse profit on the sale item
    sale_item.profit = round(sale_item.profit - profit_to_reverse, 2)
    db.commit()

    # Check notification after stock restored
    if updated_product:
        check_and_notify(db, updated_product)

    return return_record