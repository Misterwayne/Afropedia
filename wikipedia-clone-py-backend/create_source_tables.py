#!/usr/bin/env python3
"""
Script to create source and reference tables in Supabase
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables")
    exit(1)

supabase: Client = create_client(url, key)

def create_source_table():
    """Create the source table"""
    try:
        # Create source table
        source_sql = """
        CREATE TABLE IF NOT EXISTS source (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            url TEXT,
            author VARCHAR(200),
            publication VARCHAR(200),
            publication_date TIMESTAMP WITH TIME ZONE,
            access_date TIMESTAMP WITH TIME ZONE,
            source_type VARCHAR(50) NOT NULL DEFAULT 'web',
            isbn VARCHAR(20),
            doi VARCHAR(100),
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by INTEGER REFERENCES "user"(id)
        );
        """
        
        result = supabase.rpc('exec_sql', {'sql': source_sql}).execute()
        print("✅ Source table created successfully")
        
        # Create indexes
        index_sql = """
        CREATE INDEX IF NOT EXISTS idx_source_title ON source(title);
        CREATE INDEX IF NOT EXISTS idx_source_type ON source(source_type);
        CREATE INDEX IF NOT EXISTS idx_source_created_by ON source(created_by);
        """
        
        supabase.rpc('exec_sql', {'sql': index_sql}).execute()
        print("✅ Source indexes created successfully")
        
    except Exception as e:
        print(f"❌ Error creating source table: {e}")

def create_reference_table():
    """Create the reference table"""
    try:
        # Create reference table
        reference_sql = """
        CREATE TABLE IF NOT EXISTS reference (
            id SERIAL PRIMARY KEY,
            article_id INTEGER NOT NULL REFERENCES article(id) ON DELETE CASCADE,
            source_id INTEGER NOT NULL REFERENCES source(id) ON DELETE CASCADE,
            reference_number INTEGER NOT NULL,
            context TEXT,
            page_number VARCHAR(50),
            section VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by INTEGER REFERENCES "user"(id),
            UNIQUE(article_id, reference_number)
        );
        """
        
        result = supabase.rpc('exec_sql', {'sql': reference_sql}).execute()
        print("✅ Reference table created successfully")
        
        # Create indexes
        index_sql = """
        CREATE INDEX IF NOT EXISTS idx_reference_article_id ON reference(article_id);
        CREATE INDEX IF NOT EXISTS idx_reference_source_id ON reference(source_id);
        CREATE INDEX IF NOT EXISTS idx_reference_number ON reference(reference_number);
        CREATE INDEX IF NOT EXISTS idx_reference_created_by ON reference(created_by);
        """
        
        supabase.rpc('exec_sql', {'sql': index_sql}).execute()
        print("✅ Reference indexes created successfully")
        
    except Exception as e:
        print(f"❌ Error creating reference table: {e}")

def test_tables():
    """Test that the tables were created successfully"""
    try:
        # Test source table
        source_result = supabase.table("source").select("id").limit(1).execute()
        print("✅ Source table is accessible")
        
        # Test reference table
        reference_result = supabase.table("reference").select("id").limit(1).execute()
        print("✅ Reference table is accessible")
        
        return True
    except Exception as e:
        print(f"❌ Error testing tables: {e}")
        return False

def main():
    print("🚀 Creating source and reference tables...")
    
    create_source_table()
    create_reference_table()
    
    if test_tables():
        print("✅ All tables created and tested successfully!")
        print("\n📋 Tables created:")
        print("  - source: Stores source information (books, websites, journals, etc.)")
        print("  - reference: Links sources to articles with reference numbers")
        print("\n🔗 Relationships:")
        print("  - source.created_by -> user.id")
        print("  - reference.article_id -> article.id")
        print("  - reference.source_id -> source.id")
        print("  - reference.created_by -> user.id")
    else:
        print("❌ Table creation failed")

if __name__ == "__main__":
    main()
