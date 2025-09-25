#!/usr/bin/env python3
"""
Interactive script to guide you through applying the peer review migration
"""

import os
import time

def print_step(step_num, title, filename):
    """Print step information"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {title}")
    print(f"{'='*60}")
    print(f"📁 File: {filename}")
    print(f"📋 Instructions:")
    print(f"   1. Open Supabase SQL Editor")
    print(f"   2. Copy the contents of {filename}")
    print(f"   3. Paste and execute the SQL")
    print(f"   4. Press Enter here when done...")
    input()

def check_step(step_num, description):
    """Check if step was completed"""
    print(f"\n🧪 Testing Step {step_num}: {description}")
    print("Press Enter to test, or 's' to skip...")
    choice = input().lower()
    
    if choice == 's':
        print("⏭️  Skipped testing")
        return True
    
    # Run the test
    try:
        from supabase_client import supabase
        
        if step_num == 1:
            # Test if new columns exist
            result = supabase.table('peer_review').select('id, priority, reviewer_level, overall_score').limit(1).execute()
            print("✅ Step 1: New columns added successfully")
            return True
            
        elif step_num == 4:
            # Test if new tables exist
            tables = ['review_assignment', 'review_comment', 'review_template']
            for table in tables:
                result = supabase.table(table).select('id').limit(1).execute()
                print(f"✅ {table} table exists")
            print("✅ Step 4: New tables created successfully")
            return True
            
        else:
            print("✅ Step completed (no specific test)")
            return True
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("Please check the SQL and try again")
        return False

def main():
    """Main migration process"""
    print("🚀 Peer Review Schema Migration Guide")
    print("=" * 60)
    print("This script will guide you through applying the peer review migration")
    print("step by step using Supabase SQL Editor.")
    print()
    print("⚠️  IMPORTANT: Make sure you have access to your Supabase project")
    print("   and can run SQL commands in the SQL Editor.")
    print()
    
    # Check if we're in the right directory
    if not os.path.exists('step1_add_columns.sql'):
        print("❌ Error: Migration files not found")
        print("Please run this script from the backend directory")
        return
    
    steps = [
        (1, "Add Missing Columns to peer_review Table", "step1_add_columns.sql"),
        (2, "Migrate Existing Data", "step2_migrate_data.sql"),
        (3, "Add Constraints", "step3_add_constraints.sql"),
        (4, "Create New Tables", "step4_create_new_tables.sql"),
        (5, "Add Indexes", "step5_add_indexes.sql"),
        (6, "Enable RLS and Policies", "step6_enable_rls.sql")
    ]
    
    print("📋 Migration Steps:")
    for i, (num, title, _) in enumerate(steps, 1):
        print(f"   {i}. {title}")
    
    print(f"\n🎯 Total steps: {len(steps)}")
    print("Press Enter to start...")
    input()
    
    # Execute each step
    for step_num, title, filename in steps:
        print_step(step_num, title, filename)
        
        # Test the step
        if not check_step(step_num, title):
            print(f"\n❌ Step {step_num} failed. Please fix the issue and try again.")
            print("You can restart this script to continue from where you left off.")
            return
    
    # Final test
    print(f"\n🎉 Migration completed! Running final test...")
    try:
        from test_peer_review_migration import test_migration
        import asyncio
        asyncio.run(test_migration())
    except Exception as e:
        print(f"❌ Final test failed: {e}")
        print("Please check the migration and try again")
        return
    
    print(f"\n🎯 Next steps:")
    print("1. Test the peer review system in the frontend")
    print("2. Create some test reviews")
    print("3. Check the peer review dashboard")
    print("4. Test the 'New Review' button")

if __name__ == "__main__":
    main()
