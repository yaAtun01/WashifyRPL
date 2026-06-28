from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
import datetime
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=schemas.ReportResponse)
def get_report(
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    try:
        if startDate:
            start_date = datetime.datetime.strptime(startDate, "%Y-%m-%d").date()
        else:
            start_date = datetime.date.today() - datetime.timedelta(days=30)
            
        if endDate:
            end_date = datetime.datetime.strptime(endDate, "%Y-%m-%d").date()
        else:
            end_date = datetime.date.today()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format tanggal tidak valid. Gunakan YYYY-MM-DD"
        )
        
    start_dt = datetime.datetime.combine(start_date, datetime.time.min)
    end_dt = datetime.datetime.combine(end_date, datetime.time.max)
    
    orders = db.query(models.Order).join(models.Customer).join(models.Service).filter(
        models.Order.entry_date >= start_dt,
        models.Order.entry_date <= end_dt
    ).order_by(models.Order.entry_date.desc()).all()
    
    total_transactions = len(orders)
    total_income = Decimal("0.00")
    total_lunas = 0
    total_belum_lunas = 0
    laundry_selesai = 0
    laundry_belum_diambil = 0
    
    daily_income = {}
    # Pre-populate dates
    temp = start_date
    while temp <= end_date:
        daily_income[temp.strftime("%Y-%m-%d")] = Decimal("0.00")
        temp += datetime.timedelta(days=1)
        
    order_outs = []
    for o in orders:
        if o.payment_status == "LUNAS":
            total_lunas += 1
            total_income += o.total_price
            date_str = o.entry_date.strftime("%Y-%m-%d")
            daily_income[date_str] = daily_income.get(date_str, Decimal("0.00")) + o.total_price
        else:
            total_belum_lunas += 1
            
        if o.laundry_status == "SUDAH_DIAMBIL":
            laundry_selesai += 1
        else:
            laundry_belum_diambil += 1
            
        # Format output DTO
        order_outs.append(schemas.OrderOut(
            id=o.id,
            invoice_number=o.invoice_number,
            customer_id=o.customer_id,
            customer_name=o.customer.name,
            customer_email=o.customer.email,
            customer_phone=o.customer.phone,
            customer_address=o.customer.address,
            service_id=o.service_id,
            service_name=o.service.service_name,
            price_per_kg=o.service.price_per_kg,
            weight=o.weight,
            total_price=o.total_price,
            laundry_status=o.laundry_status,
            payment_status=o.payment_status,
            entry_date=o.entry_date,
            finish_date=o.finish_date,
            notes=o.notes
        ))
        
    return schemas.ReportResponse(
        totalTransactions=total_transactions,
        totalIncome=total_income,
        totalLunas=total_lunas,
        totalBelumLunas=total_belum_lunas,
        laundrySelesai=laundry_selesai,
        laundryBelumDiambil=laundry_belum_diambil,
        orders=order_outs,
        dailyIncome=daily_income
    )
