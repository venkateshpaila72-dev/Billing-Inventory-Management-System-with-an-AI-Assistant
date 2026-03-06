from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

    sales = relationship("Sale", back_populates="customer")