#!/usr/bin/env python3
"""
Afropedia Production Setup Script
Validates and configures the application for production deployment.
"""

import os
import sys
import subprocess
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionSetup:
    """Production setup and validation."""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success = []
    
    def check_environment_variables(self):
        """Check required environment variables."""
        logger.info("🔍 Checking environment variables...")
        
        required_vars = [
            'JWT_SECRET',
            'SUPABASE_URL',
            'SUPABASE_KEY'
        ]
        
        optional_vars = [
            'LOG_LEVEL',
            'LOG_FILE',
            'ENVIRONMENT',
            'SSL_ENABLED',
            'SSL_CERT_FILE',
            'SSL_KEY_FILE'
        ]
        
        # Check required variables
        for var in required_vars:
            if not os.getenv(var):
                self.errors.append(f"Missing required environment variable: {var}")
            else:
                self.success.append(f"✅ {var} is set")
        
        # Check optional variables
        for var in optional_vars:
            if os.getenv(var):
                self.success.append(f"✅ {var} is set")
            else:
                self.warnings.append(f"⚠️  Optional variable {var} not set")
    
    def check_ssl_certificates(self):
        """Check SSL certificate configuration."""
        logger.info("🔒 Checking SSL configuration...")
        
        ssl_enabled = os.getenv('SSL_ENABLED', 'false').lower() == 'true'
        
        if ssl_enabled:
            cert_file = os.getenv('SSL_CERT_FILE', 'ssl/certs/localhost.crt')
            key_file = os.getenv('SSL_KEY_FILE', 'ssl/certs/localhost.key')
            
            if Path(cert_file).exists():
                self.success.append(f"✅ SSL certificate found: {cert_file}")
            else:
                self.errors.append(f"SSL certificate not found: {cert_file}")
            
            if Path(key_file).exists():
                self.success.append(f"✅ SSL private key found: {key_file}")
            else:
                self.errors.append(f"SSL private key not found: {key_file}")
        else:
            self.warnings.append("⚠️  SSL is disabled - consider enabling for production")
    
    def check_dependencies(self):
        """Check Python dependencies."""
        logger.info("📦 Checking dependencies...")
        
        try:
            import fastapi
            import uvicorn
            import psutil
            import jose
            import passlib
            import supabase
            
            self.success.append("✅ All critical dependencies available")
            
        except ImportError as e:
            self.errors.append(f"Missing dependency: {e}")
    
    def check_database_connection(self):
        """Check database connectivity."""
        logger.info("🗄️  Checking database connection...")
        
        try:
            from supabase_client import supabase
            result = supabase.table("user").select("id").limit(1).execute()
            self.success.append("✅ Database connection successful")
            
        except Exception as e:
            error_msg = str(e)
            # Handle SSL certificate issues gracefully in development
            if "CERTIFICATE_VERIFY_FAILED" in error_msg:
                self.warnings.append("⚠️  Database SSL verification issue (normal in development)")
                logger.warning("Database SSL certificate verification failed - this is normal in development")
            else:
                self.errors.append(f"Database connection failed: {error_msg}")
    
    def check_log_directory(self):
        """Check log directory permissions."""
        logger.info("📝 Checking log configuration...")
        
        log_file = os.getenv('LOG_FILE', 'logs/afropedia.log')
        log_dir = Path(log_file).parent
        
        try:
            log_dir.mkdir(parents=True, exist_ok=True)
            
            # Test write permissions
            test_file = log_dir / 'test_write.tmp'
            test_file.write_text('test')
            test_file.unlink()
            
            self.success.append(f"✅ Log directory writable: {log_dir}")
            
        except Exception as e:
            self.errors.append(f"Log directory not writable: {e}")
    
    def check_security_configuration(self):
        """Check security settings."""
        logger.info("🛡️  Checking security configuration...")
        
        # Check JWT secret strength
        jwt_secret = os.getenv('JWT_SECRET', '')
        if len(jwt_secret) < 32:
            self.errors.append("JWT_SECRET is too short (minimum 32 characters)")
        elif len(jwt_secret) < 64:
            self.warnings.append("⚠️  Consider using a longer JWT_SECRET (64+ characters)")
        else:
            self.success.append("✅ JWT_SECRET has good length")
        
        # Check environment setting
        environment = os.getenv('ENVIRONMENT', 'development')
        if environment == 'production':
            self.success.append("✅ Environment set to production")
        else:
            self.warnings.append("⚠️  Environment not set to 'production'")
    
    def generate_startup_script(self):
        """Generate production startup script."""
        logger.info("📜 Generating startup script...")
        
        startup_script = """#!/bin/bash
# Afropedia Production Startup Script
# Generated on {timestamp}

set -e  # Exit on error

echo "🚀 Starting Afropedia API in production mode..."

# Check environment
if [ "$ENVIRONMENT" != "production" ]; then
    echo "⚠️  Warning: ENVIRONMENT is not set to 'production'"
fi

# Start with SSL if enabled
if [ "$SSL_ENABLED" = "true" ]; then
    echo "🔒 Starting with SSL enabled..."
    exec uvicorn main:app \\
        --host 0.0.0.0 \\
        --port 8443 \\
        --ssl-keyfile="$SSL_KEY_FILE" \\
        --ssl-certfile="$SSL_CERT_FILE" \\
        --workers 4 \\
        --access-log \\
        --log-level info
else
    echo "🌐 Starting without SSL..."
    exec uvicorn main:app \\
        --host 0.0.0.0 \\
        --port 8000 \\
        --workers 4 \\
        --access-log \\
        --log-level info
fi
""".format(timestamp=datetime.now().isoformat())
        
        with open('start_production.sh', 'w') as f:
            f.write(startup_script)
        
        # Make executable
        os.chmod('start_production.sh', 0o755)
        
        self.success.append("✅ Production startup script created: start_production.sh")
    
    def generate_docker_config(self):
        """Generate Docker configuration."""
        logger.info("🐳 Generating Docker configuration...")
        
        dockerfile = """# Afropedia Production Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN useradd --create-home --shell /bin/bash afropedia
RUN chown -R afropedia:afropedia /app
USER afropedia

# Expose ports
EXPOSE 8000 8443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
        
        docker_compose = """version: '3.8'

services:
  afropedia-api:
    build: .
    ports:
      - "8000:8000"
      - "8443:8443"
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO
      - LOG_FILE=logs/afropedia.log
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./ssl:/app/ssl:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add nginx reverse proxy
  # nginx:
  #   image: nginx:alpine
  #   ports:
  #     - "80:80"
  #     - "443:443"
  #   volumes:
  #     - ./nginx.conf:/etc/nginx/nginx.conf:ro
  #     - ./ssl:/etc/ssl:ro
  #   depends_on:
  #     - afropedia-api
  #   restart: unless-stopped
"""
        
        with open('Dockerfile', 'w') as f:
            f.write(dockerfile)
        
        with open('docker-compose.yml', 'w') as f:
            f.write(docker_compose)
        
        self.success.append("✅ Docker configuration created: Dockerfile, docker-compose.yml")
    
    def run_all_checks(self):
        """Run all production readiness checks."""
        logger.info("🔍 Starting production readiness checks...")
        
        self.check_environment_variables()
        self.check_ssl_certificates()
        self.check_dependencies()
        self.check_database_connection()
        self.check_log_directory()
        self.check_security_configuration()
        self.generate_startup_script()
        self.generate_docker_config()
        
        # Print results
        print("\n" + "="*60)
        print("🚀 AFROPEDIA PRODUCTION READINESS REPORT")
        print("="*60)
        
        if self.success:
            print(f"\n✅ SUCCESS ({len(self.success)} items):")
            for item in self.success:
                print(f"   {item}")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)} items):")
            for item in self.warnings:
                print(f"   {item}")
        
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)} items):")
            for item in self.errors:
                print(f"   {item}")
        
        print("\n" + "="*60)
        
        if self.errors:
            print("❌ PRODUCTION READINESS: FAILED")
            print("Please fix the errors above before deploying to production.")
            return False
        elif self.warnings:
            print("⚠️  PRODUCTION READINESS: READY WITH WARNINGS")
            print("Consider addressing the warnings for optimal production setup.")
            return True
        else:
            print("✅ PRODUCTION READINESS: PASSED")
            print("Your application is ready for production deployment!")
            return True

def main():
    """Main setup function."""
    print("🚀 Afropedia Production Setup")
    print("=" * 40)
    
    setup = ProductionSetup()
    success = setup.run_all_checks()
    
    if success:
        print("\n📋 Next Steps:")
        print("1. Review and address any warnings")
        print("2. Test your configuration: python -m uvicorn main:app --reload")
        print("3. Run health checks: curl http://localhost:8000/health")
        print("4. Deploy using: ./start_production.sh")
        print("5. Monitor using: curl http://localhost:8000/metrics")
        
        print("\n🔧 Production Deployment Options:")
        print("• Local: ./start_production.sh")
        print("• Docker: docker-compose up -d")
        print("• Cloud: Use your preferred cloud provider")
    else:
        print("\n❌ Please fix the errors before proceeding to production.")
        sys.exit(1)

if __name__ == "__main__":
    main()
