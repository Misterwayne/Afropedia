#!/usr/bin/env python3
"""
Simple script to set up moderation tables in Supabase
This script will guide you through the manual setup process
"""
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def print_setup_instructions():
    """Print step-by-step setup instructions"""
    print("🚀 Afropedia Moderation System Setup")
    print("=" * 50)
    print()
    print("The moderation system requires additional database tables.")
    print("Please follow these steps to set up the moderation system:")
    print()
    print("📋 STEP 1: Open Supabase Dashboard")
    print("   1. Go to https://supabase.com/dashboard")
    print("   2. Select your project")
    print("   3. Navigate to 'SQL Editor' in the left sidebar")
    print()
    print("📋 STEP 2: Execute the Moderation Schema")
    print("   1. Click 'New query' in the SQL Editor")
    print("   2. Copy the contents of 'moderation_schema.sql'")
    print("   3. Paste it into the SQL editor")
    print("   4. Click 'Run' to execute the SQL")
    print()
    print("📋 STEP 3: Verify Tables Created")
    print("   After running the SQL, you should see these tables created:")
    print("   - moderation_queue")
    print("   - peer_review")
    print("   - moderation_action")
    print("   - content_flag")
    print("   - user_permission")
    print()
    print("📋 STEP 4: Update User Table")
    print("   The SQL will also add these columns to the 'user' table:")
    print("   - role (default: 'user')")
    print("   - is_active (default: true)")
    print("   - reputation_score (default: 0)")
    print()
    print("📋 STEP 5: Test the System")
    print("   After setup, test the moderation system:")
    print("   python test_moderation.py")
    print()
    print("⚠️  IMPORTANT NOTES:")
    print("   - Make sure to backup your database before running the SQL")
    print("   - The SQL is safe to run multiple times (uses IF NOT EXISTS)")
    print("   - All existing data will be preserved")
    print()
    print("🔗 Files to reference:")
    print("   - moderation_schema.sql (contains the SQL to run)")
    print("   - MODERATION_SETUP.md (detailed documentation)")
    print()

def check_if_tables_exist():
    """Check if moderation tables already exist"""
    try:
        from supabase_client import supabase
        
        print("🔍 Checking if moderation tables exist...")
        
        tables_to_check = [
            'moderation_queue',
            'peer_review', 
            'moderation_action',
            'content_flag',
            'user_permission'
        ]
        
        existing_tables = []
        missing_tables = []
        
        for table in tables_to_check:
            try:
                result = supabase.table(table).select("id").limit(1).execute()
                existing_tables.append(table)
                print(f"✅ {table} - exists")
            except Exception as e:
                if "Could not find the table" in str(e):
                    missing_tables.append(table)
                    print(f"❌ {table} - missing")
                else:
                    print(f"⚠️  {table} - error: {e}")
        
        if missing_tables:
            print(f"\n📋 Missing tables: {', '.join(missing_tables)}")
            print("Please follow the setup instructions above.")
            return False
        else:
            print("\n🎉 All moderation tables are present!")
            return True
            
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        print("Please follow the setup instructions above.")
        return False

if __name__ == "__main__":
    print_setup_instructions()
    
    # Check if tables exist
    if not check_if_tables_exist():
        print("\n" + "=" * 50)
        print("Please complete the setup steps above, then run this script again to verify.")
    else:
        print("\n✅ Moderation system is ready to use!")
