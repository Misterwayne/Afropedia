# middleware/request_logging.py
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
import logging
from typing import Callable, Dict, Any

from monitoring.metrics import metrics

logger = logging.getLogger("afropedia.requests")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses."""
    
    def __init__(self, app, log_body: bool = False, max_body_size: int = 1024):
        super().__init__(app)
        self.log_body = log_body
        self.max_body_size = max_body_size
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Extract request info
        request_info = {
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "headers": dict(request.headers),
            "client_ip": self._get_client_ip(request),
            "user_agent": request.headers.get("user-agent", ""),
        }
        
        # Log request body if enabled (for non-GET requests)
        if self.log_body and request.method not in ["GET", "HEAD", "OPTIONS"]:
            try:
                body = await request.body()
                if len(body) <= self.max_body_size:
                    request_info["body"] = body.decode("utf-8", errors="ignore")
                else:
                    request_info["body"] = f"<body too large: {len(body)} bytes>"
            except Exception as e:
                request_info["body"] = f"<could not read body: {str(e)}>"
        
        # Log incoming request
        logger.info(
            f"Incoming request: {request.method} {request.url.path}",
            extra=request_info
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            # Log response
            response_info = {
                "request_id": request_id,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "response_headers": dict(response.headers),
            }
            
            # Determine log level based on status code
            if response.status_code >= 500:
                log_level = logging.ERROR
                log_message = f"Request failed: {request.method} {request.url.path} - {response.status_code}"
            elif response.status_code >= 400:
                log_level = logging.WARNING
                log_message = f"Request error: {request.method} {request.url.path} - {response.status_code}"
            else:
                log_level = logging.INFO
                log_message = f"Request completed: {request.method} {request.url.path} - {response.status_code}"
            
            logger.log(
                log_level,
                log_message,
                extra=response_info
            )
            
            # Add request ID to response headers for tracing
            response.headers["X-Request-ID"] = request_id
            
            # Record metrics
            metrics.record_request(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code,
                duration_ms=duration_ms
            )
            
            return response
            
        except Exception as e:
            # Calculate duration for failed requests
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            # Log exception
            logger.error(
                f"Request exception: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "exception": str(e),
                    "exception_type": type(e).__name__,
                    "duration_ms": duration_ms,
                },
                exc_info=True
            )
            
            # Re-raise the exception
            raise
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        # Check for forwarded headers (common in production behind proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return "unknown"

class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log security-related events."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        security_logger = logging.getLogger("afropedia.security")
        
        # Check for suspicious patterns
        suspicious_patterns = [
            "admin", "root", "test", "debug", "config",
            ".env", "password", "secret", "token",
            "../", "..\\", "<script", "javascript:",
            "union", "select", "drop", "insert", "update"
        ]
        
        request_path = request.url.path.lower()
        query_string = str(request.query_params).lower()
        
        # Log suspicious requests
        for pattern in suspicious_patterns:
            if pattern in request_path or pattern in query_string:
                security_logger.warning(
                    f"Suspicious request detected: {pattern}",
                    extra={
                        "request_id": getattr(request.state, "request_id", "unknown"),
                        "pattern": pattern,
                        "path": request.url.path,
                        "query_params": dict(request.query_params),
                        "client_ip": self._get_client_ip(request),
                        "user_agent": request.headers.get("user-agent", ""),
                    }
                )
                break
        
        # Log authentication attempts
        if "/auth/" in request_path:
            security_logger.info(
                f"Authentication attempt: {request.method} {request.url.path}",
                extra={
                    "request_id": getattr(request.state, "request_id", "unknown"),
                    "client_ip": self._get_client_ip(request),
                    "user_agent": request.headers.get("user-agent", ""),
                }
            )
        
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return "unknown"
