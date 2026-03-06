from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    selling_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    stock_qty = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)

    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    purchases = relationship("Purchase", back_populates="product")
    notifications = relationship("Notification", back_populates="product")