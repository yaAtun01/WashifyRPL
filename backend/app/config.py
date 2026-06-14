import os

class Settings:
    PROJECT_NAME: str = "Washify Admin Laundry Management System"
    _raw_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/washify_db")
    DATABASE_URL: str = _raw_url.replace("postgresql://", "postgresql+pg8000://", 1) if _raw_url.startswith("postgresql://") else _raw_url

    JWT_SECRET: str = os.getenv("JWT_SECRET", "Zm9vYmFyYmF6cXV1eG5vbnNlbnNla2V5MTIzNDU2Nzg5MGJhc2U2NA==")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

settings = Settings()
