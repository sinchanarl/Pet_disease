from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Pet Disease Detection Service"
    API_V1_STR: str = "/api/v1"

    # Gemini Settings (REQUIRED)
    GEMINI_API_KEY: str
    GEMINI_MODEL_PRIMARY: str = "gemini-2.0-flash"
    GEMINI_MODEL_FALLBACK: str = "gemini-2.0-flash"

    # AWS Settings (OPTIONAL for local)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_IMAGES: Optional[str] = None
    S3_BUCKET_BBOX: Optional[str] = None

    # Database Settings (REQUIRED locally)
    DATABASE_URL: str

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
