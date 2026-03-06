from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.notification import Notification
from datetime import datetime, timedelta
from typing import Optional


def get_revenue(db: Session, period: str) -> dict:
    now = datetime.utcnow()

    if period == "daily":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%Y-%m-%d")
    elif period == "weekly":
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        label = f"Week of {start.strftime('%Y-%m-%d')}"
    elif period == "monthly":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%B %Y")
    elif period == "yearly":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%Y")
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%Y-%m-%d")

    result = db.query(
        func.coalesce(func.sum(Sale.total), 0).label("total_revenue"),
        func.coalesce(func.sum(Sale.gst_amount), 0).label("total_gst"),
        func.coalesce(func.sum(Sale.grand_total), 0).label("grand_total"),
        func.count(Sale.id).label("total_sales")
    ).filter(Sale.created_at >= start).first()

    return {
        "period": label,
        "total_revenue": round(float(result.total_revenue), 2),
        "total_gst": round(float(result.total_gst), 2),
        "grand_total": round(float(result.grand_total), 2),
        "total_sales": result.total_sales
    }


def get_top_products(db: Session, limit: int = 5) -> list:
    results = db.query(
        SaleItem.product_id,
        Product.name.label("product_name"),
        func.sum(SaleItem.quantity).label("total_quantity_sold"),
        func.sum(SaleItem.unit_price * SaleItem.quantity).label("total_revenue")
    ).join(Product, SaleItem.product_id == Product.id)\
     .group_by(SaleItem.product_id, Product.name)\
     .order_by(func.sum(SaleItem.quantity).desc())\
     .limit(limit).all()

    return [
        {
            "product_id": r.product_id,
            "product_name": r.product_name,
            "total_quantity_sold": r.total_quantity_sold,
            "total_revenue": round(float(r.total_revenue), 2)
        }
        for r in results
    ]


def get_top_staff(db: Session, limit: int = 5) -> list:
    results = db.query(
        Sale.staff_id,
        User.name.label("staff_name"),
        func.count(Sale.id).label("total_sales"),
        func.sum(Sale.grand_total).label("total_revenue")
    ).join(User, Sale.staff_id == User.id)\
     .group_by(Sale.staff_id, User.name)\
     .order_by(func.sum(Sale.grand_total).desc())\
     .limit(limit).all()

    return [
        {
            "staff_id": r.staff_id,
            "staff_name": r.staff_name,
            "total_sales": r.total_sales,
            "total_revenue": round(float(r.total_revenue), 2)
        }
        for r in results
    ]


def get_profit(db: Session, period: str) -> dict:
    now = datetime.utcnow()

    if period == "daily":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%Y-%m-%d")
    elif period == "weekly":
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        label = f"Week of {start.strftime('%Y-%m-%d')}"
    elif period == "monthly":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%B %Y")
    elif period == "yearly":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%Y")
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        label = now.strftime("%Y-%m-%d")

    result = db.query(
        func.coalesce(func.sum(SaleItem.profit), 0).label("total_profit"),
        func.coalesce(func.sum(SaleItem.unit_price * SaleItem.quantity), 0).label("total_revenue"),
        func.coalesce(func.sum(SaleItem.cost_price_snapshot * SaleItem.quantity), 0).label("total_cost")
    ).join(Sale, SaleItem.sale_id == Sale.id)\
     .filter(Sale.created_at >= start).first()

    return {
        "period": label,
        "total_profit": round(float(result.total_profit), 2),
        "total_revenue": round(float(result.total_revenue), 2),
        "total_cost": round(float(result.total_cost), 2)
    }


def get_dashboard_stats(db: Session) -> dict:
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Today revenue and sales count
    today = db.query(
        func.coalesce(func.sum(Sale.grand_total), 0).label("revenue"),
        func.count(Sale.id).label("sales")
    ).filter(Sale.created_at >= today_start).first()

    # Today profit
    today_profit = db.query(
        func.coalesce(func.sum(SaleItem.profit), 0).label("profit")
    ).join(Sale, SaleItem.sale_id == Sale.id)\
     .filter(Sale.created_at >= today_start).scalar()

    # Total products
    total_products = db.query(func.count(Product.id)).scalar()

    # Low stock products
    low_stock = db.query(func.count(Product.id)).filter(
        Product.stock_qty <= Product.low_stock_threshold
    ).scalar()

    # Total active staff
    total_staff = db.query(func.count(User.id)).filter(
        User.role == UserRole.staff,
        User.is_active == True
    ).scalar()

    # Unread notifications
    unread = db.query(func.count(Notification.id)).filter(
        Notification.is_read == False
    ).scalar()

    return {
        "today_revenue": round(float(today.revenue), 2),
        "today_sales": today.sales,
        "today_profit": round(float(today_profit or 0), 2),
        "total_products": total_products,
        "low_stock_count": low_stock,
        "total_staff": total_staff,
        "unread_notifications": unread
    }