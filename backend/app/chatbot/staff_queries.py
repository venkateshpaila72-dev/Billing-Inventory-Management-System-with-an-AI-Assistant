from sqlalchemy.orm import Session
from app.crud.sale import get_sales_by_staff, get_sale_by_id
from app.crud.return_record import get_returns_by_sale


def handle_staff_intent(db: Session, intent: str, message: str, staff_id: int) -> str:

    if intent == "greeting":
        return (
            "Hello! I can help you with:\n"
            "- Your sales history\n"
            "- Sale details by ID\n"
            "- How billing works\n"
            "- Your returns\n"
            "What would you like to know?"
        )

    elif intent == "my_sales":
        sales = get_sales_by_staff(db, staff_id)
        if not sales:
            return "You have no sales records yet."

        msg = message.lower()
        if "today" in msg:
            from datetime import datetime
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            sales = [s for s in sales if s.created_at >= today]
            period = "today"
        elif "week" in msg:
            from datetime import datetime, timedelta
            week_start = datetime.utcnow() - timedelta(days=7)
            sales = [s for s in sales if s.created_at >= week_start]
            period = "this week"
        elif "month" in msg:
            from datetime import datetime
            now = datetime.utcnow()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            sales = [s for s in sales if s.created_at >= month_start]
            period = "this month"
        elif "year" in msg:
            from datetime import datetime
            now = datetime.utcnow()
            year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            sales = [s for s in sales if s.created_at >= year_start]
            period = "this year"
        else:
            period = "all time"

        if not sales:
            return f"You have no sales for {period}."

        total = sum(s.grand_total for s in sales)
        return (
            f"Your Sales ({period}):\n"
            f"- Total Bills: {len(sales)}\n"
            f"- Total Revenue: ₹{round(total, 2)}"
        )

    elif intent == "sale_by_id":
        words = message.lower().split()
        sale_id = None
        for word in words:
            if word.isdigit():
                sale_id = int(word)
                break
        if not sale_id:
            return "Please provide a sale ID. Example: 'show sale 5'"

        sale = get_sale_by_id(db, sale_id)
        if not sale:
            return f"Sale ID {sale_id} not found."

        # Staff can only see their own sales
        if sale.staff_id != staff_id:
            return "You can only view your own sales."

        return (
            f"Sale #{sale.bill_number}:\n"
            f"- Items: {len(sale.items)}\n"
            f"- Subtotal: ₹{sale.total}\n"
            f"- GST: ₹{sale.gst_amount}\n"
            f"- Grand Total: ₹{sale.grand_total}\n"
            f"- Date: {sale.created_at.strftime('%Y-%m-%d %H:%M')}"
        )

    elif intent == "billing_help":
        return (
            "How to create a bill:\n"
            "1. Go to the Billing page\n"
            "2. Search for products by name or filter by category\n"
            "3. Click on products to add them to cart\n"
            "4. Adjust quantities in the cart\n"
            "5. Enter customer phone number, age, and gender\n"
            "6. Click 'Preview Bill' to review\n"
            "7. Edit if needed, then click 'Confirm Bill'\n"
            "8. Print receipt from the popup"
        )

    elif intent == "my_returns":
        sales = get_sales_by_staff(db, staff_id)
        if not sales:
            return "You have no sales with returns."
        all_returns = []
        for sale in sales:
            returns = get_returns_by_sale(db, sale.id)
            all_returns.extend(returns)
        if not all_returns:
            return "No returns found for your sales."
        total_refund = sum(r.refund_amount for r in all_returns)
        return (
            f"Your Returns:\n"
            f"- Total Returns: {len(all_returns)}\n"
            f"- Total Refunded: ₹{round(total_refund, 2)}"
        )

    else:
        return (
            "I can only help you with:\n"
            "- Your sales (today/week/month/year)\n"
            "- Sale details by ID\n"
            "- Billing process help\n"
            "- Your returns\n"
            "For inventory, staff or full analytics, please contact admin."
        )