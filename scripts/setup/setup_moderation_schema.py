#!/usr/bin/env python3
"""
Setup script for moderation and peer-review system schema
"""
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase

def setup_moderation_schema():
    """Set up the moderation schema in Supabase"""
    print("🔧 Setting up moderation and peer-review schema...")
    
    # Read the moderation schema SQL
    try:
        with open('moderation_schema.sql', 'r') as f:
            schema_sql = f.read()
        
        print("📄 Executing moderation schema SQL...")
        
        # Execute the schema SQL
        result = supabase.rpc('exec_sql', {'sql': schema_sql}).execute()
        
        if result.data:
            print("✅ Moderation schema setup completed successfully!")
            print("📊 Schema includes:")
            print("   - User roles and permissions")
            print("   - Moderation queue system")
            print("   - Peer review system")
            print("   - Content flagging system")
            print("   - Moderation actions tracking")
            print("   - User permission management")
        else:
            print("❌ Failed to execute schema SQL")
            print("Please run the SQL manually in Supabase SQL Editor")
            
    except Exception as e:
        print(f"❌ Error setting up moderation schema: {e}")
        print("\n📋 Manual Setup Instructions:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy the contents of 'moderation_schema.sql'")
        print("4. Paste and execute the SQL")
        print("5. Verify tables were created")

def check_moderation_tables():
    """Check if moderation tables exist"""
    print("\n🔍 Checking moderation tables...")
    
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
        print("Please run the moderation schema setup first")
    else:
        print("\n🎉 All moderation tables are present!")
    
    return len(missing_tables) == 0

if __name__ == "__main__":
    print("🚀 Afropedia Moderation System Setup")
    print("=" * 40)
    
    # Check if tables already exist
    if check_moderation_tables():
        print("\n✅ Moderation system is already set up!")
    else:
        print("\n🔧 Setting up moderation system...")
        setup_moderation_schema()
        
        # Check again after setup
        print("\n🔍 Verifying setup...")
        check_moderation_tables()
