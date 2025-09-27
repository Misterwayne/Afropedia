# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import logging

# Import routers
from routers import articles, auth, search, music, video, images, books, supabase_router, moderation, peer_review, enhanced_search, advanced_search, monitoring, sources

# Import error handling and logging
from utils.logging_config import setup_logging
from utils.error_handlers import (
    AfropediaException,
    afropedia_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from middleware.request_logging import RequestLoggingMiddleware, SecurityLoggingMiddleware
from ssl_config.ssl_middleware import HTTPSRedirectMiddleware, SecurityHeadersMiddleware
from config import settings

# Setup logging
setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_file=os.getenv("LOG_FILE", "logs/afropedia.log"),
    enable_json=os.getenv("LOG_FORMAT", "json").lower() == "json"
)

logger = logging.getLogger("afropedia.main")

app = FastAPI(
    title="Afropedia API",
    description="A comprehensive knowledge platform for African content",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add custom middleware (order matters - last added is executed first)
app.add_middleware(RequestLoggingMiddleware, log_body=False)
app.add_middleware(SecurityLoggingMiddleware)

# Add SSL/Security middleware
if settings.security_headers_enabled:
    app.add_middleware(SecurityHeadersMiddleware)

if settings.https_redirect_enabled and os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware, enabled=True)

# CORS Configuration - Production ready
import os
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Configure CORS based on environment
if IS_PRODUCTION:
    # Production: Allow specific domains + localhost for testing
    allowed_origins = [
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://afropedia.vercel.app",  # Add your Vercel domain
        "https://afropedia-frontend.vercel.app",  # Add your actual Vercel domain
        "http://localhost:3000",  # Allow localhost for testing
        "http://localhost:3001"
    ]
else:
    # Development: Allow localhost
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Request-ID"]
)

# Add exception handlers
app.add_exception_handler(AfropediaException, afropedia_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Optional: Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(articles.router, prefix="/articles", tags=["Articles"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(enhanced_search.router, prefix="/search", tags=["Enhanced Search"])
app.include_router(advanced_search.router, prefix="/advanced-search", tags=["Advanced Search"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(music.router, prefix="/music", tags=["Music"])
app.include_router(video.router, prefix="/videos", tags=["Videos"])
app.include_router(books.router, prefix="/books", tags=["Books"])
app.include_router(sources.router, prefix="/sources", tags=["Sources & References"])
app.include_router(moderation.router, prefix="/moderation", tags=["Moderation"])
app.include_router(peer_review.router, prefix="/peer-review", tags=["Peer Review"])
app.include_router(monitoring.router, prefix="", tags=["Monitoring"])  # No prefix for monitoring endpoints
app.include_router(supabase_router.router, prefix="/supabase", tags=["Supabase"])



@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint with API information."""
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to the Afropedia API",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    logger.info("Health check performed")
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": "1.0.0"
    }

# Log application startup
logger.info("Afropedia API starting up", extra={
    "version": "1.0.0",
    "environment": os.getenv("ENVIRONMENT", "development")
})

# Optional: Event handler to create tables on startup (for dev only)
# @app.on_event("startup")
# async def on_startup():
#     print("Creating database tables...")
#     await create_db_and_tables()
#     print("Database tables created (if they didn't exist).")