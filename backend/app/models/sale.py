from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String, unique=True, nullable=False, index=True)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    total = Column(Float, nullable=False)
    gst_amount = Column(Float, nullable=False)
    grand_total = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    staff = relationship("User")
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale")
    returns = relationship("ReturnRecord", back_populates="sale")