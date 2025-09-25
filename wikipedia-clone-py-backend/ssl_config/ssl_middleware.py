# ssl/ssl_middleware.py
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse
import logging

logger = logging.getLogger("afropedia.ssl")

class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """Middleware to redirect HTTP requests to HTTPS in production."""
    
    def __init__(self, app, enabled: bool = True, permanent: bool = True):
        super().__init__(app)
        self.enabled = enabled
        self.status_code = 301 if permanent else 302
    
    async def dispatch(self, request: Request, call_next) -> Response:
        if not self.enabled:
            return await call_next(request)
        
        # Check if request is already HTTPS
        if request.url.scheme == "https":
            return await call_next(request)
        
        # Check for forwarded proto header (common in reverse proxy setups)
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "").lower()
        if forwarded_proto == "https":
            return await call_next(request)
        
        # Redirect to HTTPS
        https_url = request.url.replace(scheme="https")
        
        logger.info(
            f"Redirecting HTTP to HTTPS: {request.url} -> {https_url}",
            extra={
                "original_url": str(request.url),
                "redirect_url": str(https_url),
                "client_ip": request.client.host if request.client else "unknown",
            }
        )
        
        return RedirectResponse(url=str(https_url), status_code=self.status_code)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers for HTTPS and general security."""
    
    def __init__(
        self,
        app,
        hsts_max_age: int = 31536000,  # 1 year
        hsts_include_subdomains: bool = True,
        hsts_preload: bool = True,
        content_type_nosniff: bool = True,
        frame_options: str = "DENY",
        xss_protection: bool = True,
        referrer_policy: str = "strict-origin-when-cross-origin",
        csp_policy: str = None
    ):
        super().__init__(app)
        self.hsts_max_age = hsts_max_age
        self.hsts_include_subdomains = hsts_include_subdomains
        self.hsts_preload = hsts_preload
        self.content_type_nosniff = content_type_nosniff
        self.frame_options = frame_options
        self.xss_protection = xss_protection
        self.referrer_policy = referrer_policy
        self.csp_policy = csp_policy or "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Only add HSTS header for HTTPS requests
        if request.url.scheme == "https" or request.headers.get("X-Forwarded-Proto") == "https":
            hsts_value = f"max-age={self.hsts_max_age}"
            if self.hsts_include_subdomains:
                hsts_value += "; includeSubDomains"
            if self.hsts_preload:
                hsts_value += "; preload"
            response.headers["Strict-Transport-Security"] = hsts_value
        
        # Add other security headers
        if self.content_type_nosniff:
            response.headers["X-Content-Type-Options"] = "nosniff"
        
        if self.frame_options:
            response.headers["X-Frame-Options"] = self.frame_options
        
        if self.xss_protection:
            response.headers["X-XSS-Protection"] = "1; mode=block"
        
        if self.referrer_policy:
            response.headers["Referrer-Policy"] = self.referrer_policy
        
        if self.csp_policy:
            response.headers["Content-Security-Policy"] = self.csp_policy
        
        # Add additional security headers
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["X-Download-Options"] = "noopen"
        response.headers["X-DNS-Prefetch-Control"] = "off"
        
        return response
