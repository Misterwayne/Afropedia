#!/usr/bin/env python3
"""
SSL Certificate Generator for Afropedia
Generates self-signed certificates for development and provides production guidance.
"""

import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime, timedelta

def generate_self_signed_cert(
    domain: str = "localhost",
    cert_dir: str = "ssl/certs",
    key_size: int = 2048,
    days_valid: int = 365
):
    """Generate self-signed SSL certificate for development."""
    
    # Create certificate directory
    cert_path = Path(cert_dir)
    cert_path.mkdir(parents=True, exist_ok=True)
    
    # Certificate and key file paths
    cert_file = cert_path / f"{domain}.crt"
    key_file = cert_path / f"{domain}.key"
    
    print(f"🔐 Generating self-signed SSL certificate for {domain}...")
    
    # Generate private key
    key_cmd = [
        "openssl", "genrsa",
        "-out", str(key_file),
        str(key_size)
    ]
    
    try:
        subprocess.run(key_cmd, check=True, capture_output=True)
        print(f"✅ Private key generated: {key_file}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to generate private key: {e}")
        return False
    
    # Generate certificate
    cert_cmd = [
        "openssl", "req",
        "-new", "-x509",
        "-key", str(key_file),
        "-out", str(cert_file),
        "-days", str(days_valid),
        "-subj", f"/C=US/ST=State/L=City/O=Afropedia/OU=Development/CN={domain}"
    ]
    
    try:
        subprocess.run(cert_cmd, check=True, capture_output=True)
        print(f"✅ Certificate generated: {cert_file}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to generate certificate: {e}")
        return False
    
    # Set proper permissions
    os.chmod(key_file, 0o600)  # Private key should be read-only by owner
    os.chmod(cert_file, 0o644)  # Certificate can be world-readable
    
    print(f"\n📋 SSL Certificate Details:")
    print(f"   Domain: {domain}")
    print(f"   Valid for: {days_valid} days")
    print(f"   Certificate: {cert_file}")
    print(f"   Private Key: {key_file}")
    
    return True

def create_ssl_config():
    """Create SSL configuration file."""
    
    config_content = """# SSL Configuration for Afropedia

## Development (Self-Signed)
SSL_CERT_FILE=ssl/certs/localhost.crt
SSL_KEY_FILE=ssl/certs/localhost.key

## Production (Let's Encrypt - recommended)
# SSL_CERT_FILE=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
# SSL_KEY_FILE=/etc/letsencrypt/live/yourdomain.com/privkey.pem

## SSL Settings
SSL_ENABLED=true
SSL_PORT=8443
"""
    
    with open("ssl/ssl.conf", "w") as f:
        f.write(config_content)
    
    print("✅ SSL configuration created: ssl/ssl.conf")

def print_production_guidance():
    """Print guidance for production SSL setup."""
    
    print("\n" + "="*60)
    print("🚀 PRODUCTION SSL SETUP GUIDANCE")
    print("="*60)
    
    print("\n1. 📋 For Let's Encrypt (Recommended):")
    print("   # Install certbot")
    print("   sudo apt-get install certbot")
    print("   ")
    print("   # Generate certificate")
    print("   sudo certbot certonly --standalone -d yourdomain.com")
    print("   ")
    print("   # Update your .env file:")
    print("   SSL_CERT_FILE=/etc/letsencrypt/live/yourdomain.com/fullchain.pem")
    print("   SSL_KEY_FILE=/etc/letsencrypt/live/yourdomain.com/privkey.pem")
    
    print("\n2. 🔄 Auto-renewal setup:")
    print("   # Add to crontab")
    print("   0 12 * * * /usr/bin/certbot renew --quiet")
    
    print("\n3. 🐳 Docker with SSL:")
    print("   # Mount certificates in docker-compose.yml")
    print("   volumes:")
    print("     - /etc/letsencrypt:/etc/letsencrypt:ro")
    print("     - ./ssl:/app/ssl:ro")
    
    print("\n4. ☁️  Cloud Provider SSL:")
    print("   - AWS: Use Application Load Balancer with ACM certificates")
    print("   - Google Cloud: Use Cloud Load Balancer with managed certificates")
    print("   - Cloudflare: Enable SSL/TLS encryption")
    
    print("\n5. 🔧 Nginx Proxy (Recommended):")
    print("   # Use nginx as reverse proxy with SSL termination")
    print("   # This handles SSL and forwards to your FastAPI app")
    
    print("\n⚠️  SECURITY NOTES:")
    print("   - Never commit SSL certificates to version control")
    print("   - Use strong ciphers and TLS 1.2+ only")
    print("   - Enable HSTS headers")
    print("   - Consider certificate pinning for high security")

def main():
    """Main SSL setup function."""
    
    print("🔒 Afropedia SSL Certificate Setup")
    print("=" * 40)
    
    # Check if OpenSSL is available
    try:
        subprocess.run(["openssl", "version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ OpenSSL not found. Please install OpenSSL first.")
        sys.exit(1)
    
    # Create SSL directory
    os.makedirs("ssl", exist_ok=True)
    
    # Generate self-signed certificate for development
    success = generate_self_signed_cert()
    
    if success:
        # Create SSL configuration
        create_ssl_config()
        
        print("\n✅ Development SSL setup complete!")
        print("\nTo start the server with SSL:")
        print("   uvicorn main:app --ssl-keyfile=ssl/certs/localhost.key --ssl-certfile=ssl/certs/localhost.crt --port 8443")
        
        # Print production guidance
        print_production_guidance()
    else:
        print("\n❌ SSL setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
