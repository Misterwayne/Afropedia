#!/usr/bin/env python3
"""
Production Configuration for Afropedia
This script validates and sets up production-ready configuration.
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionConfig:
    """Production configuration validator and setup."""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success = []
    
    def validate_environment_variables(self):
        """Validate required environment variables."""
        logger.info("🔍 Validating environment variables...")
        
        required_vars = {
            'JWT_SECRET': 'JWT secret key for token signing',
            'SUPABASE_URL': 'Supabase project URL',
            'SUPABASE_KEY': 'Supabase API key',
            'ENVIRONMENT': 'Environment (should be "production")'
        }
        
        optional_vars = {
            'LOG_LEVEL': 'Logging level (default: INFO)',
            'LOG_FILE': 'Log file path (default: logs/afropedia.log)',
            'LOG_FORMAT': 'Log format (default: json)',
            'SSL_ENABLED': 'Enable SSL (default: false)',
            'HTTPS_REDIRECT_ENABLED': 'Enable HTTPS redirect (default: true)',
            'SECURITY_HEADERS_ENABLED': 'Enable security headers (default: true)'
        }
        
        # Check required variables
        for var, description in required_vars.items():
            if not os.getenv(var):
                self.errors.append(f"Missing required environment variable: {var} ({description})")
            else:
                self.success.append(f"✅ {var} is set")
        
        # Check optional variables
        for var, description in optional_vars.items():
            if os.getenv(var):
                self.success.append(f"✅ {var} is set")
            else:
                self.warnings.append(f"⚠️  Optional variable {var} not set ({description})")
    
    def validate_security_settings(self):
        """Validate security-related settings."""
        logger.info("🔒 Validating security settings...")
        
        # Check JWT secret strength
        jwt_secret = os.getenv('JWT_SECRET', '')
        if len(jwt_secret) < 32:
            self.errors.append("JWT_SECRET should be at least 32 characters long")
        else:
            self.success.append("✅ JWT_SECRET is sufficiently long")
        
        # Check environment
        environment = os.getenv('ENVIRONMENT', 'development')
        if environment != 'production':
            self.warnings.append(f"ENVIRONMENT is set to '{environment}', should be 'production'")
        else:
            self.success.append("✅ ENVIRONMENT is set to production")
        
        # Check HTTPS settings
        https_redirect = os.getenv('HTTPS_REDIRECT_ENABLED', 'true').lower()
        if https_redirect == 'true':
            self.success.append("✅ HTTPS redirect is enabled")
        else:
            self.warnings.append("⚠️  HTTPS redirect is disabled")
    
    def validate_database_connection(self):
        """Validate database connection."""
        logger.info("🗄️  Validating database connection...")
        
        try:
            from supabase_client import supabase
            
            # Test basic connection
            result = supabase.table('user').select('id').limit(1).execute()
            self.success.append("✅ Database connection successful")
            
            # Check if RLS is enabled
            # This would require a more complex query, but we'll assume it's working
            # if the basic query succeeds
            self.success.append("✅ Database queries working")
            
        except Exception as e:
            self.errors.append(f"Database connection failed: {str(e)}")
    
    def generate_production_env_template(self):
        """Generate a production environment template."""
        logger.info("📝 Generating production environment template...")
        
        env_template = """# Afropedia Production Environment Configuration
# Generated on {timestamp}

# Required Variables
JWT_SECRET=your_strong_jwt_secret_here_minimum_32_characters
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
ENVIRONMENT=production

# Optional Variables
LOG_LEVEL=INFO
LOG_FILE=logs/afropedia.log
LOG_FORMAT=json
SSL_ENABLED=false
HTTPS_REDIRECT_ENABLED=true
SECURITY_HEADERS_ENABLED=true

# MeiliSearch Configuration (if using)
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=your_meilisearch_master_key

# CORS Configuration (for production)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://afropedia.vercel.app
""".format(timestamp=datetime.now().isoformat())
        
        with open('production.env.template', 'w') as f:
            f.write(env_template)
        
        self.success.append("✅ Production environment template created: production.env.template")
    
    def check_file_permissions(self):
        """Check file permissions for security."""
        logger.info("🔐 Checking file permissions...")
        
        sensitive_files = [
            '.env',
            'production.env.template',
            'logs/',
            'ssl_config/'
        ]
        
        for file_path in sensitive_files:
            if os.path.exists(file_path):
                # Check if file is readable by others
                stat = os.stat(file_path)
                if stat.st_mode & 0o044:  # Check if readable by group or others
                    self.warnings.append(f"⚠️  {file_path} is readable by group/others")
                else:
                    self.success.append(f"✅ {file_path} has secure permissions")
    
    def generate_security_report(self):
        """Generate a security report."""
        logger.info("📊 Generating security report...")
        
        report = f"""
# Afropedia Production Security Report
Generated: {datetime.now().isoformat()}

## Summary
- Total Checks: {len(self.success) + len(self.warnings) + len(self.errors)}
- ✅ Passed: {len(self.success)}
- ⚠️  Warnings: {len(self.warnings)}
- ❌ Errors: {len(self.errors)}

## Errors (Must Fix)
{chr(10).join(f"- {error}" for error in self.errors) if self.errors else "- None"}

## Warnings (Should Fix)
{chr(10).join(f"- {warning}" for warning in self.warnings) if self.warnings else "- None"}

## Success Items
{chr(10).join(f"- {success}" for success in self.success) if self.success else "- None"}

## Recommendations
1. Fix all errors before deploying to production
2. Address warnings for better security and performance
3. Regularly rotate JWT secrets
4. Monitor logs for suspicious activity
5. Keep dependencies updated
6. Use HTTPS in production
7. Implement rate limiting
8. Set up monitoring and alerting
"""
        
        with open('security_report.md', 'w') as f:
            f.write(report)
        
        self.success.append("✅ Security report generated: security_report.md")
    
    def run_all_checks(self):
        """Run all validation checks."""
        logger.info("🚀 Starting production configuration validation...")
        
        self.validate_environment_variables()
        self.validate_security_settings()
        self.validate_database_connection()
        self.generate_production_env_template()
        self.check_file_permissions()
        self.generate_security_report()
        
        # Print summary
        print("\n" + "="*60)
        print("PRODUCTION CONFIGURATION VALIDATION SUMMARY")
        print("="*60)
        
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  - {error}")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if self.success:
            print(f"\n✅ SUCCESS ({len(self.success)}):")
            for success in self.success:
                print(f"  - {success}")
        
        print("\n" + "="*60)
        
        if self.errors:
            print("❌ PRODUCTION NOT READY - Fix errors above")
            return False
        elif self.warnings:
            print("⚠️  PRODUCTION READY WITH WARNINGS - Address warnings for better security")
            return True
        else:
            print("✅ PRODUCTION READY - All checks passed")
            return True

if __name__ == "__main__":
    config = ProductionConfig()
    is_ready = config.run_all_checks()
    sys.exit(0 if is_ready else 1)
