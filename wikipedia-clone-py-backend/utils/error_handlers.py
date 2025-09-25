# utils/error_handlers.py
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
import uuid
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("afropedia.errors")

class AfropediaException(Exception):
    """Base exception class for Afropedia-specific errors."""
    
    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class AuthenticationError(AfropediaException):
    """Authentication-related errors."""
    
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="AUTH_ERROR",
            status_code=401,
            details=details
        )

class AuthorizationError(AfropediaException):
    """Authorization-related errors."""
    
    def __init__(self, message: str = "Access denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="AUTHZ_ERROR",
            status_code=403,
            details=details
        )

class ValidationError(AfropediaException):
    """Data validation errors."""
    
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )

class ResourceNotFoundError(AfropediaException):
    """Resource not found errors."""
    
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} not found",
            error_code="RESOURCE_NOT_FOUND",
            status_code=404,
            details={"resource": resource, "identifier": identifier}
        )

class DatabaseError(AfropediaException):
    """Database-related errors."""
    
    def __init__(self, message: str = "Database operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            status_code=500,
            details=details
        )

class ExternalServiceError(AfropediaException):
    """External service errors."""
    
    def __init__(self, service: str, message: str = "External service error"):
        super().__init__(
            message=f"{service}: {message}",
            error_code="EXTERNAL_SERVICE_ERROR",
            status_code=503,
            details={"service": service}
        )

def generate_error_id() -> str:
    """Generate a unique error ID for tracking."""
    return str(uuid.uuid4())

def create_error_response(
    error_id: str,
    message: str,
    error_code: str,
    status_code: int,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a standardized error response."""
    return {
        "error": {
            "id": error_id,
            "code": error_code,
            "message": message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "details": details or {}
        }
    }

async def afropedia_exception_handler(request: Request, exc: AfropediaException) -> JSONResponse:
    """Handle Afropedia-specific exceptions."""
    error_id = generate_error_id()
    
    logger.error(
        f"Afropedia Exception: {exc.message}",
        extra={
            "error_id": error_id,
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "endpoint": str(request.url),
            "method": request.method,
            "user_agent": request.headers.get("user-agent"),
        },
        exc_info=True
    )
    
    response = create_error_response(
        error_id=error_id,
        message=exc.message,
        error_code=exc.error_code,
        status_code=exc.status_code,
        details=exc.details
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    error_id = generate_error_id()
    
    logger.warning(
        f"HTTP Exception: {exc.detail}",
        extra={
            "error_id": error_id,
            "status_code": exc.status_code,
            "endpoint": str(request.url),
            "method": request.method,
        }
    )
    
    response = create_error_response(
        error_id=error_id,
        message=exc.detail,
        error_code="HTTP_ERROR",
        status_code=exc.status_code
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    error_id = generate_error_id()
    
    logger.warning(
        f"Validation Error: {str(exc)}",
        extra={
            "error_id": error_id,
            "endpoint": str(request.url),
            "method": request.method,
            "validation_errors": exc.errors(),
        }
    )
    
    response = create_error_response(
        error_id=error_id,
        message="Request validation failed",
        error_code="VALIDATION_ERROR",
        status_code=422,
        details={"validation_errors": exc.errors()}
    )
    
    return JSONResponse(
        status_code=422,
        content=response
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    error_id = generate_error_id()
    
    logger.error(
        f"Unexpected Exception: {str(exc)}",
        extra={
            "error_id": error_id,
            "exception_type": type(exc).__name__,
            "endpoint": str(request.url),
            "method": request.method,
            "traceback": traceback.format_exc(),
        },
        exc_info=True
    )
    
    response = create_error_response(
        error_id=error_id,
        message="An unexpected error occurred",
        error_code="INTERNAL_ERROR",
        status_code=500,
        details={"exception_type": type(exc).__name__}
    )
    
    return JSONResponse(
        status_code=500,
        content=response
    )
