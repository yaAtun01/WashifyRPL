from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("", response_model=List[schemas.PaymentOut])
def get_payments(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    payments = db.query(models.Payment).join(models.Order).order_by(models.Payment.payment_date.desc()).all()
    
    out = []
    for p in payments:
        out.append(schemas.PaymentOut(
            id=p.id,
            order_id=p.order_id,
            invoice_number=p.order.invoice_number,
            amount=p.amount,
            payment_date=p.payment_date,
            payment_method=p.payment_method
        ))
    return out

@router.post("", response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: schemas.PaymentCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.id == payment_data.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    if order.payment_status == "LUNAS":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already fully paid"
        )
        
    payment = models.Payment(
        order_id=payment_data.order_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method.upper()
    )
    
    # Mark order as lunas
    order.payment_status = "LUNAS"
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return schemas.PaymentOut(
        id=payment.id,
        order_id=payment.order_id,
        invoice_number=order.invoice_number,
        amount=payment.amount,
        payment_date=payment.payment_date,
        payment_method=payment.payment_method
    )
