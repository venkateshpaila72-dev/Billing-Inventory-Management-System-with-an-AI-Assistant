from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.schemas.analytics import (
    RevenueResponse,
    TopProductResponse,
    TopStaffResponse,
    ProfitResponse,
    DashboardResponse
)
from app.crud.analytics import (
    get_revenue,
    get_top_products,
    get_top_staff,
    get_dashboard_stats
)
from app.services.profit_service import get_profit_summary
from app.models.user import User
from typing import List

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_dashboard_stats(db)


@router.get("/revenue", response_model=RevenueResponse)
def revenue(
    period: str = Query(default="daily", enum=["daily", "weekly", "monthly", "yearly"]),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_revenue(db, period)


@router.get("/top-products", response_model=List[TopProductResponse])
def top_products(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_top_products(db, limit)


@router.get("/top-staff", response_model=List[TopStaffResponse])
def top_staff(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_top_staff(db, limit)


@router.get("/profit")
def profit(
    period: str = Query(default="daily", enum=["daily", "weekly", "monthly", "yearly"]),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_profit_summary(db, period)