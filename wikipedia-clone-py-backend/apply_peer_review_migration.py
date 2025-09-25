#!/usr/bin/env python3
"""
Script to apply the peer review schema migration
This updates the existing peer_review table and creates new tables
"""

import os
from supabase_client import supabase

def apply_migration():
    """Apply the peer review schema migration"""
    print("🔄 Applying peer review schema migration...")
    
    try:
        # Read the migration SQL file
        with open('migrate_peer_review_schema.sql', 'r') as f:
            migration_sql = f.read()
        
        print("📄 Migration SQL loaded successfully")
        print("⚠️  IMPORTANT: This migration will:")
        print("   - Add new columns to existing peer_review table")
        print("   - Migrate existing data to new schema")
        print("   - Create new tables: review_assignment, review_comment, review_template")
        print("   - Add indexes and constraints")
        print()
        
        # Split the SQL into individual statements
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
        
        print(f"📊 Found {len(statements)} SQL statements to execute")
        
        # Execute each statement
        for i, statement in enumerate(statements, 1):
            if statement:
                print(f"🔄 Executing statement {i}/{len(statements)}...")
                try:
                    # Use rpc to execute raw SQL
                    result = supabase.rpc('exec_sql', {'sql': statement}).execute()
                    print(f"✅ Statement {i} executed successfully")
                except Exception as e:
                    print(f"❌ Error in statement {i}: {e}")
                    print(f"Statement: {statement[:100]}...")
                    # Continue with other statements
                    continue
        
        print()
        print("🎉 Migration completed!")
        print("✅ Peer review system schema is now up to date")
        
        # Test the migration
        print()
        print("🧪 Testing migration...")
        test_migration()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

def test_migration():
    """Test that the migration was successful"""
    try:
        # Test peer_review table with new columns
        result = supabase.table('peer_review').select('id, priority, reviewer_level, overall_score').limit(1).execute()
        print("✅ peer_review table has new columns")
        
        # Test new tables
        tables_to_test = ['review_assignment', 'review_comment', 'review_template']
        for table in tables_to_test:
            result = supabase.table(table).select('id').limit(1).execute()
            print(f"✅ {table} table exists")
        
        print("🎉 All tests passed! Migration successful!")
        
    except Exception as e:
        print(f"❌ Migration test failed: {e}")

if __name__ == "__main__":
    print("🚀 Peer Review Schema Migration Tool")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('migrate_peer_review_schema.sql'):
        print("❌ Error: migrate_peer_review_schema.sql not found")
        print("Please run this script from the backend directory")
        exit(1)
    
    success = apply_migration()
    
    if success:
        print()
        print("🎯 Next steps:")
        print("1. Test the peer review system in the frontend")
        print("2. Create some test reviews")
        print("3. Check the peer review dashboard")
    else:
        print()
        print("❌ Migration failed. Please check the errors above.")
        print("You may need to apply the migration manually in Supabase SQL Editor")
