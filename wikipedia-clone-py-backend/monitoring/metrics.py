# monitoring/metrics.py
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from collections import defaultdict, deque
import threading
from dataclasses import dataclass, field

logger = logging.getLogger("afropedia.metrics")

@dataclass
class MetricValue:
    value: float
    timestamp: datetime
    labels: Dict[str, str] = field(default_factory=dict)

class MetricsCollector:
    """Simple metrics collection system for monitoring application performance."""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.counters = defaultdict(int)
        self.gauges = defaultdict(float)
        self.histograms = defaultdict(lambda: deque(maxlen=max_history))
        self.timers = defaultdict(lambda: deque(maxlen=max_history))
        self.lock = threading.RLock()
        
        # Request metrics
        self.request_count = 0
        self.request_duration_history = deque(maxlen=max_history)
        self.error_count = 0
        self.status_code_counts = defaultdict(int)
        
        # Application metrics
        self.start_time = time.time()
    
    def increment_counter(self, name: str, value: int = 1, labels: Optional[Dict[str, str]] = None):
        """Increment a counter metric."""
        with self.lock:
            key = self._make_key(name, labels)
            self.counters[key] += value
            logger.debug(f"Counter incremented: {key} += {value}")
    
    def set_gauge(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Set a gauge metric value."""
        with self.lock:
            key = self._make_key(name, labels)
            self.gauges[key] = value
            logger.debug(f"Gauge set: {key} = {value}")
    
    def record_histogram(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Record a value in a histogram."""
        with self.lock:
            key = self._make_key(name, labels)
            self.histograms[key].append(MetricValue(
                value=value,
                timestamp=datetime.now(timezone.utc),
                labels=labels or {}
            ))
            logger.debug(f"Histogram recorded: {key} = {value}")
    
    def start_timer(self, name: str, labels: Optional[Dict[str, str]] = None) -> 'Timer':
        """Start a timer for measuring duration."""
        return Timer(self, name, labels)
    
    def record_request(self, method: str, endpoint: str, status_code: int, duration_ms: float):
        """Record HTTP request metrics."""
        with self.lock:
            self.request_count += 1
            self.request_duration_history.append(duration_ms)
            self.status_code_counts[status_code] += 1
            
            if status_code >= 400:
                self.error_count += 1
            
            # Record detailed metrics
            self.increment_counter("http_requests_total", labels={
                "method": method,
                "endpoint": endpoint,
                "status": str(status_code)
            })
            
            self.record_histogram("http_request_duration_ms", duration_ms, labels={
                "method": method,
                "endpoint": endpoint
            })
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get a summary of all metrics."""
        with self.lock:
            uptime = time.time() - self.start_time
            
            # Calculate request rate
            request_rate = self.request_count / uptime if uptime > 0 else 0
            
            # Calculate average response time
            avg_response_time = (
                sum(self.request_duration_history) / len(self.request_duration_history)
                if self.request_duration_history else 0
            )
            
            # Calculate error rate
            error_rate = (self.error_count / self.request_count * 100) if self.request_count > 0 else 0
            
            return {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "uptime_seconds": uptime,
                "application": {
                    "requests_total": self.request_count,
                    "requests_per_second": round(request_rate, 2),
                    "average_response_time_ms": round(avg_response_time, 2),
                    "error_count": self.error_count,
                    "error_rate_percent": round(error_rate, 2)
                },
                "http_status_codes": dict(self.status_code_counts),
                "counters": dict(self.counters),
                "gauges": dict(self.gauges),
                "histograms": {
                    name: {
                        "count": len(values),
                        "latest": values[-1].value if values else 0,
                        "average": sum(v.value for v in values) / len(values) if values else 0
                    } for name, values in self.histograms.items()
                }
            }
    
    def get_prometheus_metrics(self) -> str:
        """Export metrics in Prometheus format."""
        with self.lock:
            lines = []
            
            # Counters
            for name, value in self.counters.items():
                lines.append(f"# TYPE {name} counter")
                lines.append(f"{name} {value}")
            
            # Gauges
            for name, value in self.gauges.items():
                lines.append(f"# TYPE {name} gauge")
                lines.append(f"{name} {value}")
            
            # Application metrics
            lines.append("# TYPE afropedia_uptime_seconds gauge")
            lines.append(f"afropedia_uptime_seconds {time.time() - self.start_time}")
            
            lines.append("# TYPE afropedia_requests_total counter")
            lines.append(f"afropedia_requests_total {self.request_count}")
            
            lines.append("# TYPE afropedia_errors_total counter")
            lines.append(f"afropedia_errors_total {self.error_count}")
            
            return "\n".join(lines)
    
    def _make_key(self, name: str, labels: Optional[Dict[str, str]]) -> str:
        """Create a unique key for metrics with labels."""
        if not labels:
            return name
        
        label_str = ",".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return f"{name}{{{label_str}}}"

class Timer:
    """Context manager for timing operations."""
    
    def __init__(self, collector: MetricsCollector, name: str, labels: Optional[Dict[str, str]] = None):
        self.collector = collector
        self.name = name
        self.labels = labels
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration_ms = (time.time() - self.start_time) * 1000
            self.collector.record_histogram(f"{self.name}_duration_ms", duration_ms, self.labels)

# Global metrics collector
metrics = MetricsCollector()

# Convenience functions
def increment_counter(name: str, value: int = 1, **labels):
    """Increment a counter metric."""
    metrics.increment_counter(name, value, labels)

def set_gauge(name: str, value: float, **labels):
    """Set a gauge metric."""
    metrics.set_gauge(name, value, labels)

def record_histogram(name: str, value: float, **labels):
    """Record a histogram value."""
    metrics.record_histogram(name, value, labels)

def time_function(name: str, **labels):
    """Decorator to time function execution."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            with metrics.start_timer(name, labels):
                return func(*args, **kwargs)
        return wrapper
    return decorator
