from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.crud.product import get_product_by_id, update_stock
from app.crud.sale import create_sale
from app.crud.sale_item import create_sale_item
from app.crud.customer import get_or_create_customer
from app.schemas.sale import SaleCreate
from app.services.notification_service import check_and_notify


def process_bill(
    db: Session,
    data: SaleCreate,
    staff_id: int
):
    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bill must have at least one item"
        )

    # Validate all products first before doing anything
    validated_items = []
    for item_input in data.items:
        product = get_product_by_id(db, item_input.product_id)

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product ID {item_input.product_id} not found"
            )

        if product.stock_qty < item_input.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock_qty}"
            )

        if item_input.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Quantity must be greater than zero for {product.name}"
            )

        validated_items.append({
            "product": product,
            "quantity": item_input.quantity
        })

    # Calculate totals
    subtotal = 0.0
    for v in validated_items:
        subtotal += v["product"].selling_price * v["quantity"]

    gst_rate = data.gst_rate
    gst_amount = round((subtotal * gst_rate) / 100, 2)
    grand_total = round(subtotal + gst_amount, 2)
    subtotal = round(subtotal, 2)

    # Handle customer
    customer_id = None
    if data.customer:
        customer = get_or_create_customer(
            db,
            data.customer.phone,
            data.customer.age,
            data.customer.gender
        )
        customer_id = customer.id

    # Create sale record
    sale = create_sale(db, staff_id, customer_id, subtotal, gst_amount, grand_total)

    # Create sale items, deduct stock, check notifications
    for v in validated_items:
        product = v["product"]
        quantity = v["quantity"]

        profit_per_unit = product.selling_price - product.cost_price
        total_profit = round(profit_per_unit * quantity, 2)

        create_sale_item(
            db,
            sale_id=sale.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.selling_price,
            cost_price_snapshot=product.cost_price,
            gst_rate=gst_rate,
            profit=total_profit
        )

        # Deduct stock
        updated_product = update_stock(db, product.id, -quantity)

        # Check if stock is low and notify admin
        if updated_product:
            check_and_notify(db, updated_product)

    # Reload sale with items
    from app.crud.sale import get_sale_by_id
    return get_sale_by_id(db, sale.id)