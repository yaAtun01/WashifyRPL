from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, customers, services, orders, payments, reports, predictions

# Create database tables automatically
Base.metadata.create_all(bind=engine)

from sqlalchemy import text
try:
    with engine.connect() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10);"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;"))
        connection.commit()
except Exception as e:
    print(f"Startup migration warning: {e}")


app = FastAPI(
    title="Washify - Admin Laundry Management System",
    description="Python FastAPI backend service for managing admin laundry operables.",
    version="1.0.0"
)

# Setup CORS settings
# Allow local React frontend or any deployed host to exchange API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router endpoints
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(reports.router)
app.include_router(predictions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Washify Admin Laundry Management System API"}
