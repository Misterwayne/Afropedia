# routers/monitoring.py
from fastapi import APIRouter, Response, HTTPException, Depends
from fastapi.responses import PlainTextResponse
import logging
import json
from typing import Dict, Any

from monitoring.health_checks import health_checker, HealthStatus
from monitoring.metrics import metrics
from auth.dependencies import get_current_user
from models import UserRead

router = APIRouter()
logger = logging.getLogger("afropedia.monitoring")

@router.get("/health", tags=["Monitoring"])
async def health_check():
    """
    Basic health check endpoint for load balancers and monitoring systems.
    Returns simple status without detailed information.
    """
    try:
        # Run a quick health check
        basic_health = await health_checker.check_database_health()
        
        if basic_health.status in [HealthStatus.HEALTHY, HealthStatus.DEGRADED]:
            return {
                "status": "healthy" if basic_health.status == HealthStatus.HEALTHY else "degraded",
                "timestamp": basic_health.timestamp,
                "version": "1.0.0"
            }
        else:
            raise HTTPException(status_code=503, detail="Service unhealthy")
            
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Health check failed")

@router.get("/health/detailed", tags=["Monitoring"])
async def detailed_health_check():
    """
    Comprehensive health check with detailed information about all systems.
    """
    try:
        health_status = await health_checker.run_all_checks()
        
        # Determine HTTP status code based on overall health
        if health_status["status"] == "healthy":
            status_code = 200
        elif health_status["status"] == "degraded":
            status_code = 200  # Still operational
        else:
            status_code = 503  # Service unavailable
        
        return Response(
            content=json.dumps(health_status),
            status_code=status_code,
            media_type="application/json"
        )
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check system error")

@router.get("/health/ready", tags=["Monitoring"])
async def readiness_check():
    """
    Kubernetes-style readiness check.
    Returns 200 if the service is ready to receive traffic.
    """
    try:
        # Check critical dependencies
        db_health = await health_checker.check_database_health()
        
        if db_health.status in [HealthStatus.HEALTHY, HealthStatus.DEGRADED]:
            return {"status": "ready", "timestamp": db_health.timestamp}
        else:
            raise HTTPException(status_code=503, detail="Service not ready")
            
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(status_code=503, detail="Readiness check failed")

@router.get("/health/live", tags=["Monitoring"])
async def liveness_check():
    """
    Kubernetes-style liveness check.
    Returns 200 if the service is alive (should not be restarted).
    """
    try:
        # Simple check that the application is responsive
        app_health = health_checker.check_application_health()
        
        return {
            "status": "alive",
            "timestamp": app_health.timestamp,
            "uptime_seconds": app_health.details.get("uptime_seconds", 0) if app_health.details else 0
        }
        
    except Exception as e:
        logger.error(f"Liveness check failed: {e}")
        raise HTTPException(status_code=500, detail="Liveness check failed")

@router.get("/metrics", response_class=PlainTextResponse, tags=["Monitoring"])
async def prometheus_metrics():
    """
    Prometheus-compatible metrics endpoint.
    Returns metrics in Prometheus exposition format.
    """
    try:
        return metrics.get_prometheus_metrics()
    except Exception as e:
        logger.error(f"Metrics export failed: {e}")
        raise HTTPException(status_code=500, detail="Metrics export failed")

@router.get("/metrics/json", tags=["Monitoring"])
async def json_metrics():
    """
    JSON format metrics for custom monitoring systems.
    """
    try:
        return metrics.get_metrics_summary()
    except Exception as e:
        logger.error(f"JSON metrics export failed: {e}")
        raise HTTPException(status_code=500, detail="Metrics export failed")

@router.get("/status", tags=["Monitoring"])
async def service_status():
    """
    Service status endpoint with basic information.
    Public endpoint for status pages.
    """
    try:
        basic_health = await health_checker.check_database_health()
        app_health = health_checker.check_application_health()
        
        return {
            "service": "Afropedia API",
            "version": "1.0.0",
            "status": "operational" if basic_health.status == HealthStatus.HEALTHY else "degraded",
            "uptime_hours": round(app_health.details.get("uptime_hours", 0), 2) if app_health.details else 0,
            "timestamp": basic_health.timestamp,
            "environment": "production"  # This should come from config
        }
        
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return {
            "service": "Afropedia API",
            "version": "1.0.0",
            "status": "error",
            "timestamp": "unknown",
            "error": "Status check failed"
        }

# Admin-only endpoints for detailed monitoring
@router.get("/admin/health", tags=["Admin Monitoring"])
async def admin_health_check(current_user: UserRead = Depends(get_current_user)):
    """
    Admin-only detailed health information.
    Requires authentication.
    """
    # Check if user is admin (you might want to add role checking)
    logger.info(f"Admin health check requested by user {current_user.id}")
    
    try:
        return await health_checker.run_all_checks()
    except Exception as e:
        logger.error(f"Admin health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@router.get("/admin/metrics", tags=["Admin Monitoring"])
async def admin_metrics(current_user: UserRead = Depends(get_current_user)):
    """
    Admin-only detailed metrics.
    Requires authentication.
    """
    logger.info(f"Admin metrics requested by user {current_user.id}")
    
    try:
        return metrics.get_metrics_summary()
    except Exception as e:
        logger.error(f"Admin metrics failed: {e}")
        raise HTTPException(status_code=500, detail="Metrics retrieval failed")

@router.get("/ping", tags=["Monitoring"])
async def ping():
    """
    Simple ping endpoint for basic connectivity testing.
    """
    return {"message": "pong", "status": "ok"}
