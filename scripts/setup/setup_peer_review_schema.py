#!/usr/bin/env python3
"""
Peer Review Schema Setup Script
This script helps set up the peer review system database schema in Supabase
"""

import os
import sys
from pathlib import Path

def print_header():
    print("🚀 Afropedia Peer Review System Setup")
    print("=" * 50)
    print()

def print_instructions():
    print("The peer review system requires additional database tables.")
    print("Please follow these steps to set up the peer review system:")
    print()
    print("📋 STEP 1: Open Supabase Dashboard")
    print("   1. Go to https://supabase.com/dashboard")
    print("   2. Select your project")
    print("   3. Navigate to 'SQL Editor' in the left sidebar")
    print()
    print("📋 STEP 2: Execute the Peer Review Schema")
    print("   1. Click 'New query' in the SQL Editor")
    print("   2. Copy the contents of 'peer_review_schema.sql'")
    print("   3. Paste it into the SQL editor")
    print("   4. Click 'Run' to execute the SQL")
    print()
    print("📋 STEP 3: Verify Tables Created")
    print("   After running the SQL, you should see these tables created:")
    print("   - peer_review")
    print("   - review_assignment")
    print("   - review_comment")
    print("   - review_template")
    print()
    print("📋 STEP 4: Test the System")
    print("   After setup, test the peer review system:")
    print("   python test_peer_review.py")
    print()
    print("⚠️  IMPORTANT NOTES:")
    print("   - Make sure to backup your database before running the SQL")
    print("   - The SQL is safe to run multiple times (uses IF NOT EXISTS)")
    print("   - All existing data will be preserved")
    print("   - Default review templates will be created automatically")
    print()
    print("🔗 Files to reference:")
    print("   - peer_review_schema.sql (contains the SQL to run)")
    print("   - PEER_REVIEW_SETUP.md (detailed documentation)")
    print()

def check_schema_file():
    """Check if the schema file exists"""
    schema_file = Path("peer_review_schema.sql")
    if not schema_file.exists():
        print("❌ Error: peer_review_schema.sql not found!")
        print("   Please make sure the file exists in the current directory.")
        return False
    
    print("✅ peer_review_schema.sql found")
    return True

def main():
    print_header()
    
    if not check_schema_file():
        sys.exit(1)
    
    print_instructions()
    
    print("🔍 Checking if peer review tables exist...")
    print("   (This would normally check the database, but requires Supabase setup)")
    print()
    print("✅ Peer review schema setup instructions ready!")
    print()
    print("Next steps:")
    print("1. Apply the SQL schema in Supabase")
    print("2. Test the peer review system")
    print("3. Start using the advanced peer review features!")

if __name__ == "__main__":
    main()
