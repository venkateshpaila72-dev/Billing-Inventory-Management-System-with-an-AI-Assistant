from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class ReturnRecord(Base):
    __tablename__ = "return_records"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    refund_amount = Column(Float, nullable=False)
    reason = Column(String, nullable=True)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    returned_at = Column(DateTime(timezone=True), server_default=func.now())

    sale = relationship("Sale", back_populates="returns")
    product = relationship("Product")
    staff = relationship("User")