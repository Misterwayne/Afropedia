# models/standard_responses.py
from pydantic import BaseModel
from typing import Any, Optional, Dict
from datetime import datetime

class StandardResponse(BaseModel):
    """Standard API response format for all endpoints"""
    success: bool
    data: Any
    message: Optional[str] = None
    timestamp: datetime = datetime.utcnow()
    version: str = "1.0.0"

class ErrorResponse(BaseModel):
    """Standard error response format"""
    success: bool = False
    error: str
    code: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.utcnow()
    version: str = "1.0.0"

class PaginatedResponse(BaseModel):
    """Standard paginated response format"""
    success: bool = True
    data: Any
    pagination: Dict[str, Any]
    message: Optional[str] = None
    timestamp: datetime = datetime.utcnow()
    version: str = "1.0.0"

class HealthResponse(BaseModel):
    """Standard health check response"""
    status: str
    timestamp: datetime
    version: str = "1.0.0"
    services: Optional[Dict[str, str]] = None

class SearchResponse(BaseModel):
    """Standard search response format"""
    success: bool = True
    query: str
    results: Dict[str, Any]
    total_results: int
    processing_time_ms: int
    filters: Optional[Dict[str, Any]] = None
    suggestions: Optional[list] = None
    timestamp: datetime = datetime.utcnow()
    version: str = "1.0.0"
