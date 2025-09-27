# security_config.py
"""
Comprehensive security configuration for Afropedia backend
"""
import os
from typing import List, Dict, Any
from config import settings

class SecurityConfig:
    """Security configuration and validation"""
    
    # Rate limiting configurations
    RATE_LIMITS = {
        "auth": {
            "login": "5/minute",
            "register": "3/minute",
            "password_reset": "2/minute"
        },
        "api": {
            "search": "30/minute",
            "articles": "60/minute",
            "upload": "10/minute",
            "general": "100/minute"
        }
    }
    
    # CORS configuration
    CORS_ORIGINS = {
        "production": [
            "https://afropedia-one.vercel.app",
            "https://afropedia.vercel.app",
            "https://www.afropedia.org",
            "https://afropedia.org"
        ],
        "development": [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ]
    }
    
    # Security headers
    SECURITY_HEADERS = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    }
    
    # File upload security
    ALLOWED_FILE_TYPES = {
        "images": ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
        "audio": ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
        "video": ["video/mp4", "video/webm", "video/ogg", "video/avi"],
        "documents": ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    }
    
    MAX_FILE_SIZES = {
        "images": 10 * 1024 * 1024,  # 10MB
        "audio": 50 * 1024 * 1024,   # 50MB
        "video": 100 * 1024 * 1024,  # 100MB
        "documents": 25 * 1024 * 1024  # 25MB
    }
    
    # Password requirements
    PASSWORD_REQUIREMENTS = {
        "min_length": 8,
        "max_length": 128,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_special_chars": True,
        "forbidden_patterns": ["password", "123456", "qwerty", "admin"]
    }
    
    # JWT configuration
    JWT_CONFIG = {
        "algorithm": "HS256",
        "access_token_expire_minutes": 30,
        "refresh_token_expire_days": 7,
        "issuer": "afropedia-api",
        "audience": "afropedia-users"
    }
    
    # Database security
    DB_SECURITY = {
        "enable_rls": True,
        "connection_pool_size": 20,
        "max_overflow": 30,
        "pool_timeout": 30,
        "pool_recycle": 3600
    }
    
    @classmethod
    def get_cors_origins(cls) -> List[str]:
        """Get CORS origins based on environment"""
        env = os.getenv("ENVIRONMENT", "development")
        return cls.CORS_ORIGINS.get(env, cls.CORS_ORIGINS["development"])
    
    @classmethod
    def validate_password(cls, password: str) -> Dict[str, Any]:
        """Validate password against security requirements"""
        errors = []
        
        if len(password) < cls.PASSWORD_REQUIREMENTS["min_length"]:
            errors.append(f"Password must be at least {cls.PASSWORD_REQUIREMENTS['min_length']} characters long")
        
        if len(password) > cls.PASSWORD_REQUIREMENTS["max_length"]:
            errors.append(f"Password must be no more than {cls.PASSWORD_REQUIREMENTS['max_length']} characters long")
        
        if cls.PASSWORD_REQUIREMENTS["require_uppercase"] and not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if cls.PASSWORD_REQUIREMENTS["require_lowercase"] and not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if cls.PASSWORD_REQUIREMENTS["require_numbers"] and not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if cls.PASSWORD_REQUIREMENTS["require_special_chars"] and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        for pattern in cls.PASSWORD_REQUIREMENTS["forbidden_patterns"]:
            if pattern.lower() in password.lower():
                errors.append(f"Password cannot contain common patterns like '{pattern}'")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    @classmethod
    def get_file_type_category(cls, content_type: str) -> str:
        """Get file category based on content type"""
        for category, types in cls.ALLOWED_FILE_TYPES.items():
            if content_type in types:
                return category
        return "unknown"
    
    @classmethod
    def is_file_type_allowed(cls, content_type: str) -> bool:
        """Check if file type is allowed"""
        return cls.get_file_type_category(content_type) != "unknown"
    
    @classmethod
    def get_max_file_size(cls, content_type: str) -> int:
        """Get maximum file size for content type"""
        category = cls.get_file_type_category(content_type)
        return cls.MAX_FILE_SIZES.get(category, 5 * 1024 * 1024)  # Default 5MB
