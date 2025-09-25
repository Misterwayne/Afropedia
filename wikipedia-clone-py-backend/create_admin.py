#!/usr/bin/env python3
"""
Create admin user for testing
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth_supabase import create_admin_user

def main():
    print("Creating admin user...")
    user = create_admin_user()
    if user:
        print(f"✓ Admin user created: {user['username']} ({user['email']})")
        print("You can now login with:")
        print("  Username: admin")
        print("  Password: admin123")
    else:
        print("✗ Failed to create admin user")

if __name__ == "__main__":
    main()
