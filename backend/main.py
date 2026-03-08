from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models

from app.routers import (
    auth, users, password, categories, suppliers,
    products, purchases, customers, sales,
    notifications, returns, analytics, chatbot
)


from app.database.base import Base
from app.database.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Billing & Inventory System",
    description="POS and Inventory Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(password.router)
app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(purchases.router)
app.include_router(customers.router)
app.include_router(sales.router)
app.include_router(notifications.router)
app.include_router(returns.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)






@app.get("/")
def root():
    return {"message": "Billing System API is running"}