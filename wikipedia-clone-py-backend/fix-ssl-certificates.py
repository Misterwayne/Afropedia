#!/usr/bin/env python3
"""
SSL Certificate Fix for Supabase Connection
This script helps resolve SSL certificate verification issues in development.
"""

import os
import ssl
import certifi
import urllib3
from pathlib import Path

def fix_ssl_certificates():
    """Fix SSL certificate issues for development"""
    print("🔧 Fixing SSL Certificate Issues...")
    
    # 1. Set certificate bundle environment variables
    cert_path = certifi.where()
    print(f"📄 Using certificate bundle: {cert_path}")
    
    os.environ['SSL_CERT_FILE'] = cert_path
    os.environ['REQUESTS_CA_BUNDLE'] = cert_path
    os.environ['CURL_CA_BUNDLE'] = cert_path
    
    # 2. Verify certificate bundle exists
    if not os.path.exists(cert_path):
        print(f"❌ Certificate bundle not found at: {cert_path}")
        return False
    
    print(f"✅ Certificate bundle verified: {cert_path}")
    
    # 3. Test SSL context
    try:
        context = ssl.create_default_context(cafile=cert_path)
        print("✅ SSL context created successfully")
    except Exception as e:
        print(f"❌ SSL context creation failed: {e}")
        return False
    
    # 4. Update environment file if it exists
    env_file = Path(".env")
    if env_file.exists():
        env_content = env_file.read_text()
        
        # Add SSL certificate environment variables to .env
        ssl_vars = [
            f"SSL_CERT_FILE={cert_path}",
            f"REQUESTS_CA_BUNDLE={cert_path}",
            f"CURL_CA_BUNDLE={cert_path}"
        ]
        
        updated = False
        for var in ssl_vars:
            var_name = var.split('=')[0]
            if var_name not in env_content:
                env_content += f"\n{var}"
                updated = True
        
        if updated:
            env_file.write_text(env_content)
            print("✅ Updated .env file with SSL certificate paths")
    
    print("🎉 SSL certificate fix applied successfully!")
    print("\n📋 Next steps:")
    print("1. Restart your Python application")
    print("2. Test database connection")
    print("3. If issues persist, check your system's certificate store")
    
    return True

def test_supabase_connection():
    """Test Supabase connection after SSL fix"""
    print("\n🧪 Testing Supabase connection...")
    
    try:
        from supabase_client import supabase
        
        # Simple test query
        result = supabase.table("user").select("id").limit(1).execute()
        print("✅ Supabase connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        
        if "CERTIFICATE_VERIFY_FAILED" in str(e):
            print("\n🔧 Additional SSL troubleshooting:")
            print("1. Try updating certificates: pip install --upgrade certifi")
            print("2. Check system certificates: ls /etc/ssl/certs/")
            print("3. For development only, you can disable SSL verification")
            
        return False

if __name__ == "__main__":
    print("🔒 SSL Certificate Fix Utility")
    print("=" * 40)
    
    # Apply SSL fix
    if fix_ssl_certificates():
        # Test connection
        test_supabase_connection()
    
    print("\n💡 For production deployment:")
    print("   - Use proper SSL certificates from your hosting provider")
    print("   - Enable SSL verification for security")
    print("   - Consider using environment-specific configurations")
