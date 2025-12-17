from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str = "your-super-secret-key-change-this-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "dev"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    
    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "cognitus_ai"

    CONTAINER_IMAGE_NAME: str = "python:3.12.12-slim-bookworm"
    CONTAINER_NETWORK: str = "cognitus-ai"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
