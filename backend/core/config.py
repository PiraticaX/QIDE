"""Core configuration — Python 3.11 compatible."""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Quantum Enterprise Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite+aiosqlite:///./quantum_platform.db"
    )

    # Redis (optional — graceful degradation if not present)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production-please")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ]

    # Email (OTP)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASS: Optional[str] = os.getenv("SMTP_PASS", None)
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@quantum-platform.com")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
