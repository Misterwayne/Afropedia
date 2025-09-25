#!/usr/bin/env python3
"""
Supabase-compatible authentication functions
"""

from supabase_client import supabase
from auth.security import get_password_hash, verify_password
from models import User, UserRead, UserCreate
from typing import Optional

async def get_user_by_username_supabase(username: str) -> Optional[User]:
    """Get user by username using Supabase"""
    try:
        result = supabase.table("user").select("*").eq("username", username).execute()
        if result.data:
            user_data = result.data[0]
            return User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=user_data["hashed_password"],
                role=user_data.get("role", "user"),
                is_active=user_data.get("is_active", True),
                reputation_score=user_data.get("reputation_score", 0),
                created_at=user_data["created_at"],
                updated_at=user_data["updated_at"]
            )
        return None
    except Exception as e:
        print(f"Error getting user by username: {e}")
        return None

async def get_user_by_email_supabase(email: str) -> Optional[User]:
    """Get user by email using Supabase"""
    try:
        result = supabase.table("user").select("*").eq("email", email).execute()
        if result.data:
            user_data = result.data[0]
            return User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=user_data["hashed_password"],
                role=user_data.get("role", "user"),
                is_active=user_data.get("is_active", True),
                reputation_score=user_data.get("reputation_score", 0),
                created_at=user_data["created_at"],
                updated_at=user_data["updated_at"]
            )
        return None
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None

async def create_user_supabase(user_in: UserCreate) -> User:
    """Create user using Supabase"""
    try:
        hashed_password = get_password_hash(user_in.password)
        result = supabase.table("user").insert({
            "username": user_in.username,
            "email": user_in.email,
            "hashed_password": hashed_password
        }).execute()
        
        if result.data:
            user_data = result.data[0]
            return User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=user_data["hashed_password"],
                role=user_data.get("role", "user"),
                is_active=user_data.get("is_active", True),
                reputation_score=user_data.get("reputation_score", 0),
                created_at=user_data["created_at"],
                updated_at=user_data["updated_at"]
            )
        raise Exception("Failed to create user")
    except Exception as e:
        print(f"Error creating user: {e}")
        raise

def create_admin_user():
    """Create admin user for testing"""
    try:
        # Check if admin exists
        result = supabase.table("user").select("*").eq("username", "admin").execute()
        if result.data:
            print("Admin user already exists")
            return result.data[0]
        
        # Create admin user
        hashed_password = get_password_hash("admin123")
        result = supabase.table("user").insert({
            "username": "admin",
            "email": "admin@afropedia.com",
            "hashed_password": hashed_password
        }).execute()
        
        if result.data:
            print("Admin user created successfully")
            return result.data[0]
        else:
            print("Failed to create admin user")
            return None
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return None
