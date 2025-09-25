#!/usr/bin/env python3
"""
Debug password hashing issue
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from auth.security import get_password_hash, verify_password

def debug_password():
    """Debug the password hashing issue"""
    print("Debugging password hashing...")
    
    # Get the admin user from database
    try:
        result = supabase.table("user").select("*").eq("username", "admin").execute()
        if result.data:
            user_data = result.data[0]
            print(f"User found: {user_data['username']}")
            print(f"Stored password hash: {user_data['hashed_password']}")
            print(f"Hash length: {len(user_data['hashed_password'])}")
            print(f"Hash starts with: {user_data['hashed_password'][:20]}...")
            
            # Test if it's a valid bcrypt hash
            try:
                is_valid = verify_password("admin123", user_data['hashed_password'])
                print(f"Password verification: {'SUCCESS' if is_valid else 'FAILED'}")
            except Exception as e:
                print(f"Password verification error: {e}")
                print("This suggests the stored hash is not in bcrypt format")
            
            # Generate a proper bcrypt hash
            print("\nGenerating proper bcrypt hash...")
            proper_hash = get_password_hash("admin123")
            print(f"Proper hash: {proper_hash}")
            print(f"Proper hash length: {len(proper_hash)}")
            print(f"Proper hash starts with: {proper_hash[:20]}...")
            
            # Test the proper hash
            try:
                is_valid_proper = verify_password("admin123", proper_hash)
                print(f"Proper hash verification: {'SUCCESS' if is_valid_proper else 'FAILED'}")
            except Exception as e:
                print(f"Proper hash verification error: {e}")
            
            return user_data['hashed_password'], proper_hash
        else:
            print("No admin user found")
            return None, None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None, None

def fix_admin_password():
    """Fix the admin user's password hash"""
    print("\nFixing admin password...")
    
    try:
        # Generate proper hash
        proper_hash = get_password_hash("admin123")
        
        # Update the user in database
        result = supabase.table("user").update({
            "hashed_password": proper_hash
        }).eq("username", "admin").execute()
        
        if result.data:
            print("✓ Admin password updated successfully")
            
            # Verify the fix
            user_data = result.data[0]
            is_valid = verify_password("admin123", user_data['hashed_password'])
            print(f"✓ Password verification after fix: {'SUCCESS' if is_valid else 'FAILED'}")
            return True
        else:
            print("✗ Failed to update admin password")
            return False
    except Exception as e:
        print(f"✗ Error fixing password: {e}")
        return False

def main():
    """Main debug function"""
    print("Password Hashing Debug")
    print("=" * 40)
    
    old_hash, proper_hash = debug_password()
    
    if old_hash and proper_hash:
        print("\n" + "=" * 40)
        print("FIXING PASSWORD HASH")
        print("=" * 40)
        success = fix_admin_password()
        
        if success:
            print("\n✓ PASSWORD FIXED!")
            print("You can now login with:")
            print("  Username: admin")
            print("  Password: admin123")
        else:
            print("\n✗ FAILED TO FIX PASSWORD")
    else:
        print("\n✗ Could not debug password - check database connection")

if __name__ == "__main__":
    main()
