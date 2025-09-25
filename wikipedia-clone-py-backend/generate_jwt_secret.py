#!/usr/bin/env python3
"""
JWT Secret Generator for Afropedia
Generates a cryptographically secure JWT secret key.
"""

import secrets
import string
import os

def generate_jwt_secret(length: int = 64) -> str:
    """Generate a cryptographically secure JWT secret."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def update_env_file(secret: str):
    """Update or create .env file with JWT secret."""
    env_path = ".env"
    
    # Read existing .env content
    env_content = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_content[key.strip()] = value.strip()
    
    # Update JWT secret
    env_content['JWT_SECRET'] = secret
    
    # Write back to .env file
    with open(env_path, 'w') as f:
        f.write("# Afropedia Environment Configuration\n")
        f.write("# Generated JWT Secret - DO NOT SHARE\n\n")
        for key, value in env_content.items():
            f.write(f"{key}={value}\n")
    
    print(f"✅ Updated {env_path} with new JWT secret")

def main():
    """Generate and configure JWT secret."""
    print("🔐 Generating secure JWT secret...")
    
    # Generate secure secret
    secret = generate_jwt_secret()
    
    print(f"Generated JWT Secret: {secret[:8]}...{secret[-8:]} (length: {len(secret)})")
    
    # Update .env file
    update_env_file(secret)
    
    print("\n📋 Next steps:")
    print("1. Verify your .env file has been updated")
    print("2. Restart your FastAPI server")
    print("3. Test authentication endpoints")
    print("\n⚠️  SECURITY NOTE:")
    print("- Keep your JWT secret secure and private")
    print("- Use different secrets for development/staging/production")
    print("- Consider rotating secrets periodically")

if __name__ == "__main__":
    main()
