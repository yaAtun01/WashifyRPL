from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register")
def register(register_data: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == register_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )

    new_user = models.User(
        name=register_data.name,
        email=register_data.email,
        password=auth.hash_password(register_data.password),
        role="ADMIN",
        is_verified=True,
        otp_code=None
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "Registrasi berhasil. Silakan login menggunakan email dan password Anda.",
        "email": new_user.email
    }

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    if not auth.verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
        
    # Generate token
    token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    
    return schemas.Token(
        token=token,
        email=user.email,
        role=user.role,
        name=user.name
    )


