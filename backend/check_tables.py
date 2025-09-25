#!/usr/bin/env python3
"""
Check if database tables exist in Supabase
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from config import settings

def check_tables():
    """Check which tables exist in the database"""
    print("Checking database tables...")
    print(f"Supabase URL: {settings.supabase_url}")
    print()
    
    tables_to_check = [
        "user", "article", "revision", "comment", "book", 
        "music_content", "music_metadata", "video_content", 
        "videos", "image_content", "image_metadata"
    ]
    
    existing_tables = []
    missing_tables = []
    
    for table in tables_to_check:
        try:
            # Try to select from each table to verify it exists
            result = supabase.table(table).select("*").limit(1).execute()
            print(f"✓ Table '{table}' exists and is accessible")
            existing_tables.append(table)
        except Exception as e:
            print(f"✗ Table '{table}' missing or inaccessible: {e}")
            missing_tables.append(table)
    
    print("\n" + "="*50)
    print("TABLE CHECK SUMMARY")
    print("="*50)
    print(f"Existing tables: {len(existing_tables)}")
    print(f"Missing tables: {len(missing_tables)}")
    
    if missing_tables:
        print("\nMissing tables:")
        for table in missing_tables:
            print(f"  - {table}")
        
        print("\n" + "="*50)
        print("SETUP REQUIRED")
        print("="*50)
        print("To create the missing tables, you have two options:")
        print()
        print("Option 1: Manual Setup (Recommended)")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to the SQL Editor")
        print("3. Copy and paste the contents of 'setup_schema.sql'")
        print("4. Execute the SQL to create all tables")
        print("5. Run this script again to verify")
        print()
        print("Option 2: Try Automatic Setup")
        print("1. Run: python setup_schema.py")
        print("2. If that fails, use Option 1")
        print()
        print("After creating tables, run:")
        print("python populate_supabase.py")
        print("="*50)
    else:
        print("\n✓ All tables exist! You can now run:")
        print("python populate_supabase.py")

def main():
    """Main function"""
    check_tables()

if __name__ == "__main__":
    main()
