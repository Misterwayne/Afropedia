# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Supabase configuration
    supabase_url: str
    supabase_key: str
    
    # JWT Configuration - CRITICAL for production
    jwt_secret: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30  # Reduced from 60 for better security
    
    # SSL Configuration
    ssl_enabled: bool = False
    ssl_cert_file: str = "ssl_config/certs/localhost.crt"
    ssl_key_file: str = "ssl_config/certs/localhost.key"
    ssl_port: int = 8443
    
    # Security Settings
    https_redirect_enabled: bool = True
    security_headers_enabled: bool = True
    
    # Logging Configuration
    environment: str = "development"
    log_level: str = "INFO"
    log_file: str = "logs/afropedia.log"
    log_format: str = "standard"  # "standard" or "json"
    
    # Search Configuration
    meilisearch_url: str = "http://localhost:7700"
    meilisearch_master_key: str = "masterKey"
    
    # SSL Certificate Bundle Configuration (for fixing certificate verification issues)
    requests_ca_bundle: Optional[str] = None  
    curl_ca_bundle: Optional[str] = None
    
    # For backward compatibility
    database_url: str = ""

    # Load from .env file
    model_config = SettingsConfigDict(env_file='.env')

# Use lru_cache to cache settings so .env is read only once
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()