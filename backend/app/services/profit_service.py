from sqlalchemy.orm import Session
from app.crud.analytics import get_profit


def get_profit_summary(db: Session, period: str) -> dict:
    profit_data = get_profit(db, period)

    # Calculate profit margin percentage
    if profit_data["total_revenue"] > 0:
        margin = round(
            (profit_data["total_profit"] / profit_data["total_revenue"]) * 100, 2
        )
    else:
        margin = 0.0

    profit_data["profit_margin_percent"] = margin
    return profit_data