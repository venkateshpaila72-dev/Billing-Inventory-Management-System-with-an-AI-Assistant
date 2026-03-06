from sqlalchemy.orm import Session
from app.crud.notification import (
    get_unread_notification_for_product,
    create_notification
)
from app.models.product import Product


def check_and_notify(db: Session, product: Product) -> None:
    # Check if stock is at or below threshold
    if product.stock_qty <= product.low_stock_threshold:

        # Check if unread notification already exists for this product
        existing = get_unread_notification_for_product(db, product.id)
        if existing:
            # Already notified, skip to avoid duplicates
            return

        # Create new low stock notification
        message = (
            f"Low stock alert: '{product.name}' has only "
            f"{product.stock_qty} units left "
            f"(threshold: {product.low_stock_threshold})"
        )
        create_notification(db, product.id, message)