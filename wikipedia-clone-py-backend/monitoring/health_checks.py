# monitoring/health_checks.py
import asyncio
import time
import logging
import psutil
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

from supabase_client import supabase
from search_service import search_service

logger = logging.getLogger("afropedia.health")

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"
    UNKNOWN = "unknown"

@dataclass
class HealthCheck:
    name: str
    status: HealthStatus
    message: str
    duration_ms: float
    timestamp: str
    details: Optional[Dict[str, Any]] = None

class HealthChecker:
    """Comprehensive health checking system."""
    
    def __init__(self):
        self.start_time = time.time()
        self.check_timeout = 5.0  # 5 seconds timeout for each check
    
    async def check_database_health(self) -> HealthCheck:
        """Check database connectivity and performance."""
        start_time = time.time()
        
        try:
            # Simple query to test connection
            result = supabase.table("user").select("id").limit(1).execute()
            
            duration = (time.time() - start_time) * 1000
            
            if duration > 1000:  # Slow query warning
                return HealthCheck(
                    name="database",
                    status=HealthStatus.DEGRADED,
                    message=f"Database responding slowly ({duration:.1f}ms)",
                    duration_ms=duration,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    details={"query_time_ms": duration, "threshold_ms": 1000}
                )
            
            return HealthCheck(
                name="database",
                status=HealthStatus.HEALTHY,
                message="Database connection successful",
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={"query_time_ms": duration}
            )
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            error_msg = str(e)
            
            # Don't fail completely on SSL certificate issues in development
            if "CERTIFICATE_VERIFY_FAILED" in error_msg:
                logger.warning(f"Database SSL verification issue (normal in development): {error_msg}")
                return HealthCheck(
                    name="database",
                    status=HealthStatus.DEGRADED,
                    message="Database connection has SSL verification issues (normal in development)",
                    duration_ms=duration,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    details={"error": error_msg, "error_type": type(e).__name__, "ssl_issue": True}
                )
            
            logger.error(f"Database health check failed: {e}")
            
            return HealthCheck(
                name="database",
                status=HealthStatus.UNHEALTHY,
                message=f"Database connection failed: {error_msg}",
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={"error": error_msg, "error_type": type(e).__name__}
            )
    
    async def check_search_health(self) -> HealthCheck:
        """Check search service health."""
        start_time = time.time()
        
        try:
            # Test search functionality
            result = await search_service.search_articles("test", limit=1)
            
            duration = (time.time() - start_time) * 1000
            
            if result and "hits" in result:
                return HealthCheck(
                    name="search",
                    status=HealthStatus.HEALTHY,
                    message="Search service operational",
                    duration_ms=duration,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    details={"search_time_ms": duration, "results_found": len(result.get("hits", []))}
                )
            else:
                return HealthCheck(
                    name="search",
                    status=HealthStatus.DEGRADED,
                    message="Search service responding but no results structure",
                    duration_ms=duration,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    details={"search_time_ms": duration}
                )
                
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(f"Search health check failed: {e}")
            
            return HealthCheck(
                name="search",
                status=HealthStatus.UNHEALTHY,
                message=f"Search service failed: {str(e)}",
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={"error": str(e), "error_type": type(e).__name__}
            )
    
    def check_system_resources(self) -> HealthCheck:
        """Check system resource usage."""
        start_time = time.time()
        
        try:
            # Get system metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Define thresholds
            cpu_threshold = 80.0
            memory_threshold = 80.0
            disk_threshold = 90.0
            
            issues = []
            status = HealthStatus.HEALTHY
            
            if cpu_percent > cpu_threshold:
                issues.append(f"High CPU usage: {cpu_percent:.1f}%")
                status = HealthStatus.DEGRADED
            
            if memory.percent > memory_threshold:
                issues.append(f"High memory usage: {memory.percent:.1f}%")
                status = HealthStatus.DEGRADED
            
            if disk.percent > disk_threshold:
                issues.append(f"High disk usage: {disk.percent:.1f}%")
                status = HealthStatus.DEGRADED
            
            duration = (time.time() - start_time) * 1000
            
            message = "System resources normal" if not issues else "; ".join(issues)
            
            return HealthCheck(
                name="system_resources",
                status=status,
                message=message,
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "memory_available_gb": round(memory.available / (1024**3), 2),
                    "disk_percent": disk.percent,
                    "disk_free_gb": round(disk.free / (1024**3), 2)
                }
            )
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(f"System resources health check failed: {e}")
            
            return HealthCheck(
                name="system_resources",
                status=HealthStatus.UNKNOWN,
                message=f"Could not check system resources: {str(e)}",
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={"error": str(e)}
            )
    
    def check_application_health(self) -> HealthCheck:
        """Check application-specific health metrics."""
        start_time = time.time()
        
        try:
            uptime_seconds = time.time() - self.start_time
            uptime_hours = uptime_seconds / 3600
            
            # Check if app has been running for a reasonable time
            if uptime_seconds < 30:  # Less than 30 seconds
                status = HealthStatus.DEGRADED
                message = "Application recently started"
            else:
                status = HealthStatus.HEALTHY
                message = f"Application running normally (uptime: {uptime_hours:.1f}h)"
            
            duration = (time.time() - start_time) * 1000
            
            return HealthCheck(
                name="application",
                status=status,
                message=message,
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={
                    "uptime_seconds": uptime_seconds,
                    "uptime_hours": round(uptime_hours, 2),
                    "start_time": datetime.fromtimestamp(self.start_time, timezone.utc).isoformat()
                }
            )
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            
            return HealthCheck(
                name="application",
                status=HealthStatus.UNKNOWN,
                message=f"Could not check application health: {str(e)}",
                duration_ms=duration,
                timestamp=datetime.now(timezone.utc).isoformat(),
                details={"error": str(e)}
            )
    
    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks and return comprehensive status."""
        logger.info("Starting comprehensive health check")
        
        # Run checks concurrently
        checks = await asyncio.gather(
            self.check_database_health(),
            self.check_search_health(),
            asyncio.to_thread(self.check_system_resources),
            asyncio.to_thread(self.check_application_health),
            return_exceptions=True
        )
        
        # Process results
        health_checks = []
        overall_status = HealthStatus.HEALTHY
        
        for check in checks:
            if isinstance(check, Exception):
                logger.error(f"Health check failed with exception: {check}")
                health_checks.append(HealthCheck(
                    name="unknown",
                    status=HealthStatus.UNHEALTHY,
                    message=f"Health check exception: {str(check)}",
                    duration_ms=0,
                    timestamp=datetime.now(timezone.utc).isoformat()
                ))
                overall_status = HealthStatus.UNHEALTHY
            else:
                health_checks.append(check)
                
                # Determine overall status
                if check.status == HealthStatus.UNHEALTHY:
                    overall_status = HealthStatus.UNHEALTHY
                elif check.status == HealthStatus.DEGRADED and overall_status == HealthStatus.HEALTHY:
                    overall_status = HealthStatus.DEGRADED
        
        # Create summary
        total_checks = len(health_checks)
        healthy_checks = sum(1 for check in health_checks if check.status == HealthStatus.HEALTHY)
        degraded_checks = sum(1 for check in health_checks if check.status == HealthStatus.DEGRADED)
        unhealthy_checks = sum(1 for check in health_checks if check.status == HealthStatus.UNHEALTHY)
        
        summary = {
            "status": overall_status.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "checks": {check.name: {
                "status": check.status.value,
                "message": check.message,
                "duration_ms": check.duration_ms,
                "timestamp": check.timestamp,
                "details": check.details
            } for check in health_checks},
            "summary": {
                "total_checks": total_checks,
                "healthy": healthy_checks,
                "degraded": degraded_checks,
                "unhealthy": unhealthy_checks
            }
        }
        
        logger.info(f"Health check completed: {overall_status.value} ({healthy_checks}/{total_checks} healthy)")
        
        return summary

# Global health checker instance
health_checker = HealthChecker()
