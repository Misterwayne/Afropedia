#!/usr/bin/env python3
"""
Railway startup script for Afropedia Backend
Handles PORT environment variable and other Railway-specific configurations
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Start the FastAPI application with Railway-specific configuration."""
    
    # Get port from Railway environment variable, default to 8000
    port = os.getenv("PORT", "8000")
    
    # Ensure port is an integer
    try:
        port = int(port)
    except ValueError:
        print(f"Warning: Invalid PORT value '{port}', using default 8000")
        port = 8000
    
    # Set other Railway-specific environment variables
    os.environ.setdefault("ENVIRONMENT", "production")
    os.environ.setdefault("LOG_LEVEL", "INFO")
    os.environ.setdefault("LOG_FORMAT", "json")
    
    # Ensure logs directory exists
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    print(f"Starting Afropedia Backend on port {port}")
    print(f"Environment: {os.getenv('ENVIRONMENT')}")
    print(f"Log level: {os.getenv('LOG_LEVEL')}")
    
    # Start uvicorn with proper configuration
    cmd = [
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
        "--workers", "1",  # Railway free tier works best with 1 worker
        "--log-level", "info",
        "--access-log"
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting application: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("Application stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    main()
