from sqlalchemy.orm import Session
from app.crud.analytics import (
    get_revenue,
    get_top_products,
    get_top_staff,
    get_dashboard_stats
)
from app.services.profit_service import get_profit_summary
from app.crud.notification import get_unread_notifications, get_unread_count
from app.crud.sale import get_sale_by_id, get_all_sales
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.supplier import Supplier


def handle_admin_intent(db: Session, intent: str, message: str) -> str:

    if intent == "greeting":
        return "Hello Admin! I can help you with sales, revenue, profit, inventory, staff, suppliers and notifications. What would you like to know?"

    elif intent == "revenue_daily":
        data = get_revenue(db, "daily")
        return (
            f"Today's Revenue:\n"
            f"- Sales Count: {data['total_sales']}\n"
            f"- Subtotal: ₹{data['total_revenue']}\n"
            f"- GST: ₹{data['total_gst']}\n"
            f"- Grand Total: ₹{data['grand_total']}"
        )

    elif intent == "revenue_weekly":
        data = get_revenue(db, "weekly")
        return (
            f"This Week's Revenue ({data['period']}):\n"
            f"- Sales Count: {data['total_sales']}\n"
            f"- Subtotal: ₹{data['total_revenue']}\n"
            f"- GST: ₹{data['total_gst']}\n"
            f"- Grand Total: ₹{data['grand_total']}"
        )

    elif intent == "revenue_monthly":
        data = get_revenue(db, "monthly")
        return (
            f"This Month's Revenue ({data['period']}):\n"
            f"- Sales Count: {data['total_sales']}\n"
            f"- Subtotal: ₹{data['total_revenue']}\n"
            f"- GST: ₹{data['total_gst']}\n"
            f"- Grand Total: ₹{data['grand_total']}"
        )

    elif intent == "revenue_yearly":
        data = get_revenue(db, "yearly")
        return (
            f"This Year's Revenue ({data['period']}):\n"
            f"- Sales Count: {data['total_sales']}\n"
            f"- Subtotal: ₹{data['total_revenue']}\n"
            f"- GST: ₹{data['total_gst']}\n"
            f"- Grand Total: ₹{data['grand_total']}"
        )

    elif intent in ["profit_daily", "profit_weekly", "profit_monthly", "profit_yearly"]:
        period = intent.replace("profit_", "")
        data = get_profit_summary(db, period)
        return (
            f"Profit Summary ({data['period']}):\n"
            f"- Total Revenue: ₹{data['total_revenue']}\n"
            f"- Total Cost: ₹{data['total_cost']}\n"
            f"- Total Profit: ₹{data['total_profit']}\n"
            f"- Profit Margin: {data['profit_margin_percent']}%"
        )

    elif intent == "inventory_status":
        products = db.query(Product).all()
        if not products:
            return "No products found in inventory."
        lines = [f"Inventory Status ({len(products)} products):"]
        for p in products[:10]:
            status = "LOW STOCK" if p.stock_qty <= p.low_stock_threshold else "OK"
            lines.append(f"- {p.name}: {p.stock_qty} units [{status}]")
        if len(products) > 10:
            lines.append(f"...and {len(products) - 10} more products.")
        return "\n".join(lines)

    elif intent == "low_stock":
        products = db.query(Product).filter(
            Product.stock_qty <= Product.low_stock_threshold
        ).all()
        if not products:
            return "No products are currently low on stock."
        lines = ["Low Stock Products:"]
        for p in products:
            lines.append(f"- {p.name}: {p.stock_qty} units left (threshold: {p.low_stock_threshold})")
        return "\n".join(lines)

    elif intent == "top_products":
        data = get_top_products(db, 5)
        if not data:
            return "No sales data available yet."
        lines = ["Top 5 Best Selling Products:"]
        for i, p in enumerate(data, 1):
            lines.append(f"{i}. {p['product_name']} - {p['total_quantity_sold']} units sold (₹{p['total_revenue']})")
        return "\n".join(lines)

    elif intent == "top_staff":
        data = get_top_staff(db, 5)
        if not data:
            return "No sales data available yet."
        lines = ["Top Performing Staff:"]
        for i, s in enumerate(data, 1):
            lines.append(f"{i}. {s['staff_name']} - {s['total_sales']} sales (₹{s['total_revenue']})")
        return "\n".join(lines)

    elif intent == "all_staff":
        staff = db.query(User).filter(User.role == UserRole.staff).all()
        if not staff:
            return "No staff accounts found."
        lines = [f"Staff List ({len(staff)} members):"]
        for s in staff:
            status = "Active" if s.is_active else "Inactive"
            lines.append(f"- {s.name} ({s.email}) [{status}]")
        return "\n".join(lines)

    elif intent == "all_suppliers":
        suppliers = db.query(Supplier).all()
        if not suppliers:
            return "No suppliers found."
        lines = [f"Suppliers ({len(suppliers)}):"]
        for s in suppliers:
            lines.append(f"- {s.name} | Contact: {s.contact or 'N/A'} | Email: {s.email or 'N/A'}")
        return "\n".join(lines)

    elif intent == "notifications":
        count = get_unread_count(db)
        notifs = get_unread_notifications(db)
        if count == 0:
            return "No unread notifications."
        lines = [f"You have {count} unread notification(s):"]
        for n in notifs[:5]:
            lines.append(f"- {n.message}")
        return "\n".join(lines)

    elif intent == "all_sales":
        sales = get_all_sales(db)
        if not sales:
            return "No sales records found."
        total = sum(s.grand_total for s in sales)
        return (
            f"Sales Overview:\n"
            f"- Total Bills: {len(sales)}\n"
            f"- Total Revenue: ₹{round(total, 2)}"
        )

    elif intent == "sale_by_id":
        words = message.lower().split()
        sale_id = None
        for i, word in enumerate(words):
            if word.isdigit():
                sale_id = int(word)
                break
        if not sale_id:
            return "Please provide a sale ID. Example: 'show sale 5'"
        sale = get_sale_by_id(db, sale_id)
        if not sale:
            return f"Sale ID {sale_id} not found."
        return (
            f"Sale #{sale.bill_number}:\n"
            f"- Staff ID: {sale.staff_id}\n"
            f"- Items: {len(sale.items)}\n"
            f"- Subtotal: ₹{sale.total}\n"
            f"- GST: ₹{sale.gst_amount}\n"
            f"- Grand Total: ₹{sale.grand_total}\n"
            f"- Date: {sale.created_at.strftime('%Y-%m-%d %H:%M')}"
        )

    elif intent == "billing_help":
        return (
            "Billing Process:\n"
            "1. Staff logs in with their account\n"
            "2. Search for products by name or browse by category\n"
            "3. Add items to cart with quantity\n"
            "4. Enter customer phone, age, and gender\n"
            "5. Review the bill preview with GST breakdown\n"
            "6. Click confirm to finalize the bill\n"
            "7. Print receipt if needed"
        )

    else:
        return "I'm not sure about that. You can ask me about: revenue, profit, inventory, low stock, top products, top staff, staff list, suppliers, notifications, or sales."