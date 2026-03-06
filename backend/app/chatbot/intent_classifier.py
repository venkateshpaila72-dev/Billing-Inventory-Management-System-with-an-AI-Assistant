def classify_intent(message: str) -> str:
    msg = message.lower().strip()

    # Greeting
    if any(word in msg for word in ["hello", "hi", "hey", "help"]):
        return "greeting"

    # Sales queries
    if any(word in msg for word in ["my sales", "my revenue", "i sold", "sales today", "sales this week", "sales this month", "sales this year", "how many sales"]):
        return "my_sales"

    if any(word in msg for word in ["all sales", "total sales", "everyone sales", "staff sales"]):
        return "all_sales"

    # Sale by ID
    if ("sale" in msg or "bill" in msg) and any(word in msg for word in ["id", "number", "find", "search", "details"]):
        return "sale_by_id"

    # Revenue
    if any(word in msg for word in ["revenue", "income", "earnings", "money made"]):
        if any(word in msg for word in ["today", "daily"]):
            return "revenue_daily"
        elif any(word in msg for word in ["week", "weekly"]):
            return "revenue_weekly"
        elif any(word in msg for word in ["month", "monthly"]):
            return "revenue_monthly"
        elif any(word in msg for word in ["year", "yearly", "annual"]):
            return "revenue_yearly"
        return "revenue_daily"

    # Profit
    if any(word in msg for word in ["profit", "margin", "earning"]):
        if any(word in msg for word in ["today", "daily"]):
            return "profit_daily"
        elif any(word in msg for word in ["week", "weekly"]):
            return "profit_weekly"
        elif any(word in msg for word in ["month", "monthly"]):
            return "profit_monthly"
        elif any(word in msg for word in ["year", "yearly"]):
            return "profit_yearly"
        return "profit_daily"

    # Inventory / Products
    if any(word in msg for word in ["inventory", "stock", "products", "items"]):
        if any(word in msg for word in ["low", "less", "shortage", "alert", "running out"]):
            return "low_stock"
        return "inventory_status"

    # Top products
    if any(word in msg for word in ["top product", "best product", "most sold", "popular product", "selling product"]):
        return "top_products"

    # Top staff
    if any(word in msg for word in ["top staff", "best staff", "performance", "who sold", "most sales staff"]):
        return "top_staff"

    # Staff details
    if any(word in msg for word in ["staff", "employee", "workers", "team"]):
        return "all_staff"

    # Suppliers
    if any(word in msg for word in ["supplier", "vendor", "distributor"]):
        return "all_suppliers"

    # Notifications
    if any(word in msg for word in ["notification", "alert", "unread"]):
        return "notifications"

    # Billing help
    if any(word in msg for word in ["how to bill", "billing process", "how to sell", "how to add", "billing help", "how does billing"]):
        return "billing_help"

    # Returns
    if any(word in msg for word in ["return", "refund"]):
        return "my_returns"

    return "unknown"