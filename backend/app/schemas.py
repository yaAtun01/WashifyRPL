from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from decimal import Decimal
from datetime import datetime, date

# --- User & Token Schemas ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)

class VerifyRegister(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    token: str
    type: str = "Bearer"
    email: str
    role: str
    name: str

# --- Customer Schemas ---
class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    email: EmailStr

class CustomerOut(BaseModel):
    id: int
    name: str
    phone: str
    address: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Service Schemas ---
class ServiceCreate(BaseModel):
    service_name: str = Field(..., min_length=1)
    price_per_kg: Decimal = Field(..., gt=0)
    estimation_day: int = Field(..., ge=1)
    is_active: Optional[bool] = True

class ServiceOut(BaseModel):
    id: int
    service_name: str
    price_per_kg: Decimal
    estimation_day: int
    is_active: bool

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderCreate(BaseModel):
    customer_id: int
    service_id: int
    weight: Decimal = Field(..., gt=0)
    laundry_status: Optional[str] = "DITERIMA"
    payment_status: Optional[str] = "BELUM_BAYAR"
    payment_method: Optional[str] = "CASH"
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    customer_id: int
    service_id: int
    weight: Decimal = Field(..., gt=0)
    laundry_status: str
    payment_status: str
    payment_method: Optional[str] = "CASH"
    notes: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    invoice_number: str
    customer_id: int
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    service_id: int
    service_name: str
    price_per_kg: Decimal
    weight: Decimal
    total_price: Decimal
    laundry_status: str
    payment_status: str
    entry_date: datetime
    finish_date: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# --- Payment Schemas ---
class PaymentCreate(BaseModel):
    order_id: int
    amount: Decimal = Field(..., gt=0)
    payment_method: str

class PaymentOut(BaseModel):
    id: int
    order_id: int
    invoice_number: str
    amount: Decimal
    payment_date: datetime
    payment_method: str

    class Config:
        from_attributes = True

# --- Dashboard & Reports Schemas ---
class DashboardStats(BaseModel):
    totalCustomers: int
    totalServices: int
    totalTransactions: int
    laundryDiterima: int
    laundryDicuci: int
    laundryDisetrika: int
    laundrySiapDiambil: int
    laundrySudahDiambil: int
    incomeToday: Decimal
    incomeThisWeek: Decimal
    incomeThisMonth: Decimal

class ReportResponse(BaseModel):
    totalTransactions: int
    totalIncome: Decimal
    totalLunas: int
    totalBelumLunas: int
    laundrySelesai: int
    laundryBelumDiambil: int
    orders: List[OrderOut]
    dailyIncome: Dict[str, Decimal]

class PredictionResponse(BaseModel):
    prediction7Days: Optional[Decimal] = None
    prediction30Days: Optional[Decimal] = None
    historicalPoints: Dict[str, Decimal]
    predictionPoints: Dict[str, Decimal]
    status: Optional[str] = None # For messages like "Data transaksi belum cukup..."
