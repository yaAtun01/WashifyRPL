import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="ADMIN", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    otp_code = Column(String(10), nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    estimation_day = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    weight = Column(Numeric(5, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)
    laundry_status = Column(String(30), default="DITERIMA", nullable=False)  # DITERIMA, DICUCI, DISETRIKA, SIAP_DIAMBIL, SUDAH_DIAMBIL
    payment_status = Column(String(20), default="BELUM_BAYAR", nullable=False)  # BELUM_BAYAR, LUNAS
    entry_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    finish_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    customer = relationship("Customer")
    service = relationship("Service")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    payment_method = Column(String(50), nullable=False)  # CASH, TRANSFER, E-WALLET

    order = relationship("Order", back_populates="payments")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(20), nullable=False)  # DAILY, WEEKLY, MONTHLY, YEARLY
    total_income = Column(Numeric(15, 2), nullable=False)
    total_transaction = Column(Integer, nullable=False)
    report_date = Column(Date, nullable=False)
