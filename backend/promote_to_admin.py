#!/usr/bin/env python3
"""
Promote user to admin role
"""
import asyncio
import os
import sys
from supabase_client import supabase

async def promote_to_admin():
    """Promote the admin user to admin role"""
    print("👑 Promoting user to admin role...")
    
    try:
        # Update the user with username "admin" to have admin role
        result = supabase.table("user").update({
            "role": "admin",
            "reputation_score": 1000
        }).eq("username", "admin").execute()
        
        if result.data:
            print(f"✅ User promoted to admin successfully!")
            print(f"   Username: {result.data[0]['username']}")
            print(f"   Email: {result.data[0]['email']}")
            print(f"   Role: {result.data[0]['role']}")
            print(f"   Reputation: {result.data[0]['reputation_score']}")
            return True
        else:
            print("❌ Failed to promote user to admin")
            return False
            
    except Exception as e:
        print(f"❌ Error promoting user: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(promote_to_admin())
    sys.exit(0 if success else 1)
