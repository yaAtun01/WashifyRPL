import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def get_order_response(order: models.Order) -> schemas.OrderOut:
    return schemas.OrderOut(
        id=order.id,
        invoice_number=order.invoice_number,
        customer_id=order.customer_id,
        customer_name=order.customer.name,
        customer_email=order.customer.email,
        customer_phone=order.customer.phone,
        customer_address=order.customer.address,
        service_id=order.service_id,
        service_name=order.service.service_name,
        price_per_kg=order.service.price_per_kg,
        weight=order.weight,
        total_price=order.total_price,
        laundry_status=order.laundry_status,
        payment_status=order.payment_status,
        entry_date=order.entry_date,
        finish_date=order.finish_date,
        notes=order.notes
    )

@router.get("", response_model=List[schemas.OrderOut])
def get_orders(
    search: Optional[str] = None, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    query = db.query(models.Order).join(models.Customer).join(models.Service)
    if search:
        query = query.filter(
            models.Order.invoice_number.ilike(f"%{search}%") | 
            models.Customer.name.ilike(f"%{search}%")
        )
    orders = query.order_by(models.Order.entry_date.desc()).all()
    return [get_order_response(o) for o in orders]

@router.get("/track/{invoice_number}", response_model=schemas.OrderOut)
def get_order_by_invoice(invoice_number: str, db: Session = Depends(get_db)):
    # Public tracking endpoint
    order = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.invoice_number == invoice_number
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return get_order_response(order)

@router.get("/dashboard-stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    total_customers = db.query(models.Customer).count()
    total_services = db.query(models.Service).count()
    total_transactions = db.query(models.Order).count()
    
    laundry_diterima = db.query(models.Order).filter(models.Order.laundry_status == "DITERIMA").count()
    laundry_dicuci = db.query(models.Order).filter(models.Order.laundry_status == "DICUCI").count()
    laundry_disetrika = db.query(models.Order).filter(models.Order.laundry_status == "DISETRIKA").count()
    laundry_siap_diambil = db.query(models.Order).filter(models.Order.laundry_status == "SIAP_DIAMBIL").count()
    laundry_sudah_diambil = db.query(models.Order).filter(models.Order.laundry_status == "SUDAH_DIAMBIL").count()

    today = datetime.date.today()
    start_of_today = datetime.datetime.combine(today, datetime.time.min)
    end_of_today = datetime.datetime.combine(today, datetime.time.max)

    # Income Today
    income_today = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.payment_status == "LUNAS",
        models.Order.entry_date >= start_of_today,
        models.Order.entry_date <= end_of_today
    ).scalar() or Decimal("0.00")

    # Income This Week (Monday to Sunday)
    start_of_week = today - datetime.timedelta(days=today.weekday())
    start_of_week_dt = datetime.datetime.combine(start_of_week, datetime.time.min)
    income_this_week = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.payment_status == "LUNAS",
        models.Order.entry_date >= start_of_week_dt,
        models.Order.entry_date <= end_of_today
    ).scalar() or Decimal("0.00")

    # Income This Month
    start_of_month = today.replace(day=1)
    start_of_month_dt = datetime.datetime.combine(start_of_month, datetime.time.min)
    income_this_month = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.payment_status == "LUNAS",
        models.Order.entry_date >= start_of_month_dt,
        models.Order.entry_date <= end_of_today
    ).scalar() or Decimal("0.00")

    return schemas.DashboardStats(
        totalCustomers=total_customers,
        totalServices=total_services,
        totalTransactions=total_transactions,
        laundryDiterima=laundry_diterima,
        laundryDicuci=laundry_dicuci,
        laundryDisetrika=laundry_disetrika,
        laundrySiapDiambil=laundry_siap_diambil,
        laundrySudahDiambil=laundry_sudah_diambil,
        incomeToday=income_today,
        incomeThisWeek=income_this_week,
        incomeThisMonth=income_this_month
    )

@router.get("/{id}", response_model=schemas.OrderOut)
def get_order(
    id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    order = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.id == id
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {id} not found"
        )
    return get_order_response(order)

@router.post("", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    customer = db.query(models.Customer).filter(models.Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
        
    service = db.query(models.Service).filter(models.Service.id == order_data.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service package not found"
        )

    # Compute total price
    total_price = Decimal(str(order_data.weight)) * service.price_per_kg

    # Generate Invoice Number WSF-YYYYMMDD-0001
    today_str = datetime.date.today().strftime("%Y%m%d")
    start_of_day = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    end_of_day = datetime.datetime.combine(datetime.date.today(), datetime.time.max)
    
    # Count orders entered today
    today_orders_count = db.query(models.Order).filter(
        models.Order.entry_date >= start_of_day,
        models.Order.entry_date <= end_of_day
    ).count()
    
    seq = today_orders_count + 1
    invoice_number = f"WSF-{today_str}-{seq:04d}"

    order = models.Order(
        customer_id=order_data.customer_id,
        service_id=order_data.service_id,
        invoice_number=invoice_number,
        weight=order_data.weight,
        total_price=total_price,
        laundry_status=order_data.laundry_status or "DITERIMA",
        payment_status=order_data.payment_status or "BELUM_BAYAR",
        notes=order_data.notes
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)

    # Handle payment creation if paid at launch
    if order.payment_status == "LUNAS":
        payment = models.Payment(
            order_id=order.id,
            amount=total_price,
            payment_method=order_data.payment_method or "CASH"
        )
        db.add(payment)
        db.commit()
        
    # Re-fetch with joins to return
    order_joined = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.id == order.id
    ).first()
    return get_order_response(order_joined)

@router.put("/{id}", response_model=schemas.OrderOut)
def update_order(
    id: int, 
    order_data: schemas.OrderUpdate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {id} not found"
        )
        
    service = db.query(models.Service).filter(models.Service.id == order_data.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service package not found"
        )

    customer = db.query(models.Customer).filter(models.Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Recompute total price
    total_price = Decimal(str(order_data.weight)) * service.price_per_kg
    
    # Handle transition to LUNAS
    if order_data.payment_status == "LUNAS" and order.payment_status == "BELUM_BAYAR":
        payment = models.Payment(
            order_id=order.id,
            amount=total_price,
            payment_method=order_data.payment_method or "CASH"
        )
        db.add(payment)

    order.customer_id = order_data.customer_id
    order.service_id = order_data.service_id
    order.weight = order_data.weight
    order.total_price = total_price
    order.laundry_status = order_data.laundry_status
    order.payment_status = order_data.payment_status
    order.notes = order_data.notes

    if order_data.laundry_status == "SUDAH_DIAMBIL" and order.finish_date is None:
        order.finish_date = datetime.datetime.utcnow()
    elif order_data.laundry_status != "SUDAH_DIAMBIL":
        order.finish_date = None

    db.commit()
    
    # Re-fetch joined
    order_joined = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.id == id
    ).first()
    return get_order_response(order_joined)

@router.put("/{id}/status", response_model=schemas.OrderOut)
def update_laundry_status(
    id: int, 
    status_str: str, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {id} not found"
        )
        
    order.laundry_status = status_str.upper()
    if status_str.upper() == "SUDAH_DIAMBIL":
        order.finish_date = datetime.datetime.utcnow()
    else:
        order.finish_date = None
        
    db.commit()
    
    order_joined = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.id == id
    ).first()
    return get_order_response(order_joined)

@router.put("/{id}/payment", response_model=schemas.OrderOut)
def update_payment_status(
    id: int, 
    status_str: str, 
    method: Optional[str] = "CASH", 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {id} not found"
        )
        
    new_status = status_str.upper()
    if new_status == "LUNAS" and order.payment_status == "BELUM_BAYAR":
        payment = models.Payment(
            order_id=order.id,
            amount=order.total_price,
            payment_method=method or "CASH"
        )
        db.add(payment)
        
    order.payment_status = new_status
    db.commit()
    
    order_joined = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.id == id
    ).first()
    return get_order_response(order_joined)

@router.delete("/{id}")
def delete_order(
    id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {id} not found"
        )
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}
