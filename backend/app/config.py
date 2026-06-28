import os

class Settings:
    PROJECT_NAME: str = "Washify Admin Laundry Management System"
    DATABASE_URL: str = os.getenv("DATABASE _URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/washify_db")
    # Gunakan psycopg2 (sudah ada di requirements.txt) — tidak perlu replace ke pg8000
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/washify_db")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "Zm9vYmFyYmF6cXV1eG5vbnNlbnNla2V5MTIzNDU2Nzg5MGJhc2U2NA==")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

settings = Settings()
