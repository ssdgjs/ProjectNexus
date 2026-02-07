from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://nexus:nexus_password@db:5432/nexus"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Upload
    UPLOAD_DIR: str = "/app/uploads"
    MAX_FILE_SIZE: int = 31457280  # 30MB in bytes

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
