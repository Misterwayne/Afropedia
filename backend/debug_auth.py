#!/usr/bin/env python3
"""
Debug authentication issues
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from config import settings
from auth.security import get_password_hash, verify_password

def check_database_state():
    """Check the current state of the database"""
    print("=== DATABASE DEBUG INFO ===")
    print(f"Supabase URL: {settings.supabase_url}")
    print(f"JWT Secret: {settings.jwt_secret[:10]}..." if settings.jwt_secret else "JWT Secret: NOT SET")
    print()
    
    # Check if tables exist
    tables_to_check = ["user", "article", "revision", "comment", "book"]
    
    for table in tables_to_check:
        try:
            result = supabase.table(table).select("*").limit(1).execute()
            print(f"✓ Table '{table}' exists")
        except Exception as e:
            print(f"✗ Table '{table}' error: {e}")
    
    print()
    
    # Check if users exist
    try:
        users = supabase.table("user").select("*").execute()
        print(f"Users in database: {len(users.data)}")
        for user in users.data:
            print(f"  - {user['username']} ({user['email']})")
    except Exception as e:
        print(f"Error checking users: {e}")
    
    print()

def test_password_hashing():
    """Test password hashing functionality"""
    print("=== PASSWORD HASHING TEST ===")
    
    test_password = "admin123"
    print(f"Testing password: {test_password}")
    
    try:
        # Hash the password
        hashed = get_password_hash(test_password)
        print(f"✓ Password hashed successfully: {hashed[:20]}...")
        
        # Verify the password
        is_valid = verify_password(test_password, hashed)
        print(f"✓ Password verification: {'SUCCESS' if is_valid else 'FAILED'}")
        
        # Test with wrong password
        is_wrong = verify_password("wrongpassword", hashed)
        print(f"✓ Wrong password test: {'FAILED (expected)' if not is_wrong else 'SUCCESS (unexpected)'}")
        
    except Exception as e:
        print(f"✗ Password hashing error: {e}")
    
    print()

def create_test_user():
    """Create a test user for debugging"""
    print("=== CREATING TEST USER ===")
    
    try:
        # Check if admin user already exists
        existing = supabase.table("user").select("*").eq("username", "admin").execute()
        if existing.data:
            print("Admin user already exists, updating password...")
            # Update the password
            hashed_password = get_password_hash("admin123")
            result = supabase.table("user").update({
                "hashed_password": hashed_password
            }).eq("username", "admin").execute()
            print("✓ Admin user password updated")
        else:
            print("Creating new admin user...")
            # Create new user
            hashed_password = get_password_hash("admin123")
            result = supabase.table("user").insert({
                "username": "admin",
                "email": "admin@afropedia.com",
                "hashed_password": hashed_password
            }).execute()
            print("✓ Admin user created")
        
        # Verify the user was created/updated
        user = supabase.table("user").select("*").eq("username", "admin").execute()
        if user.data:
            print(f"✓ User verified: {user.data[0]['username']}")
            
            # Test password verification
            stored_hash = user.data[0]['hashed_password']
            is_valid = verify_password("admin123", stored_hash)
            print(f"✓ Password verification: {'SUCCESS' if is_valid else 'FAILED'}")
        else:
            print("✗ User not found after creation")
            
    except Exception as e:
        print(f"✗ Error creating/updating user: {e}")
    
    print()

def test_login_flow():
    """Test the complete login flow"""
    print("=== TESTING LOGIN FLOW ===")
    
    try:
        # Get the admin user
        user = supabase.table("user").select("*").eq("username", "admin").execute()
        if not user.data:
            print("✗ Admin user not found")
            return
        
        user_data = user.data[0]
        print(f"Found user: {user_data['username']}")
        
        # Test password verification
        is_valid = verify_password("admin123", user_data['hashed_password'])
        print(f"Password verification: {'SUCCESS' if is_valid else 'FAILED'}")
        
        if is_valid:
            print("✓ Login should work with these credentials:")
            print(f"  Username: admin")
            print(f"  Password: admin123")
        else:
            print("✗ Password verification failed - login will not work")
            
    except Exception as e:
        print(f"✗ Error testing login flow: {e}")

def main():
    """Main debug function"""
    print("Afropedia Authentication Debug")
    print("=" * 40)
    
    check_database_state()
    test_password_hashing()
    create_test_user()
    test_login_flow()
    
    print("=" * 40)
    print("DEBUG COMPLETE")
    print("=" * 40)
    print("If you're still having login issues:")
    print("1. Make sure your .env file has JWT_SECRET set")
    print("2. Check that the database tables exist")
    print("3. Verify the user was created successfully")
    print("4. Try the login again")

if __name__ == "__main__":
    main()
