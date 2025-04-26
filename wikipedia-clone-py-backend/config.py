# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Load from .env file
    model_config = SettingsConfigDict(env_file='.env')

# Use lru_cache to cache settings so .env is read only once
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()