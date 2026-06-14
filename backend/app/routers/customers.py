from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=List[schemas.CustomerOut])
def get_customers(
    search: Optional[str] = None, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            models.Customer.name.ilike(f"%{search}%") | 
            models.Customer.email.ilike(f"%{search}%")
        )
    return query.all()

@router.get("/{id}", response_model=schemas.CustomerOut)
def get_customer(
    id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {id} not found"
        )
    return customer

@router.post("", response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: schemas.CustomerCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    # Check email unique constraint
    existing = db.query(models.Customer).filter(models.Customer.email == customer_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
        
    customer = models.Customer(
        name=customer_data.name,
        phone=customer_data.phone,
        address=customer_data.address,
        email=customer_data.email
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{id}", response_model=schemas.CustomerOut)
def update_customer(
    id: int, 
    customer_data: schemas.CustomerCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {id} not found"
        )
        
    # Check email unique constraint for others
    existing = db.query(models.Customer).filter(
        models.Customer.email == customer_data.email, 
        models.Customer.id != id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
        
    customer.name = customer_data.name
    customer.phone = customer_data.phone
    customer.address = customer_data.address
    customer.email = customer_data.email
    
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{id}")
def delete_customer(
    id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {id} not found"
        )
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}
