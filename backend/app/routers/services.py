from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("", response_model=List[schemas.ServiceOut])
def get_services(
    search: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Service)
    if search:
        query = query.filter(models.Service.service_name.ilike(f"%{search}%"))
    return query.all()

@router.get("/{id}", response_model=schemas.ServiceOut)
def get_service(
    id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    service = db.query(models.Service).filter(models.Service.id == id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with id {id} not found"
        )
    return service

@router.post("", response_model=schemas.ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    service_data: schemas.ServiceCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    service = models.Service(
        service_name=service_data.service_name,
        price_per_kg=service_data.price_per_kg,
        estimation_day=service_data.estimation_day,
        is_active=service_data.is_active if service_data.is_active is not None else True
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/{id}", response_model=schemas.ServiceOut)
def update_service(
    id: int, 
    service_data: schemas.ServiceCreate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    service = db.query(models.Service).filter(models.Service.id == id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with id {id} not found"
        )
        
    service.service_name = service_data.service_name
    service.price_per_kg = service_data.price_per_kg
    service.estimation_day = service_data.estimation_day
    if service_data.is_active is not None:
        service.is_active = service_data.is_active
        
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{id}")
def delete_service(
    id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(auth.get_current_admin)
):
    service = db.query(models.Service).filter(models.Service.id == id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with id {id} not found"
        )
    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}
