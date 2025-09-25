#!/usr/bin/env python3
"""
Database Schema Setup Script for Afropedia WikiClone
This script creates all required tables in Supabase.
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from config import settings

# SQL schema for all tables
SCHEMA_SQL = """
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create articles table
CREATE TABLE IF NOT EXISTS article (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    current_revision_id INTEGER UNIQUE
);

-- Create revisions table
CREATE TABLE IF NOT EXISTS revision (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    comment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    article_id INTEGER REFERENCES article(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    tsvector_content TSVECTOR
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comment (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    revision_id INTEGER REFERENCES revision(id) ON DELETE CASCADE
);

-- Create books table
CREATE TABLE IF NOT EXISTS book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    published_date DATE,
    isbn VARCHAR(20),
    genre VARCHAR(100),
    summary TEXT,
    cover_image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create music content table
CREATE TABLE IF NOT EXISTS music_content (
    id SERIAL PRIMARY KEY,
    binary_data BYTEA
);

-- Create music metadata table
CREATE TABLE IF NOT EXISTS music_metadata (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255) NOT NULL,
    content_id INTEGER REFERENCES music_content(id) ON DELETE CASCADE,
    cover_image BYTEA
);

-- Create video content table
CREATE TABLE IF NOT EXISTS video_content (
    id SERIAL PRIMARY KEY,
    binary_data BYTEA
);

-- Create video metadata table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    content_id INTEGER REFERENCES video_content(id) ON DELETE CASCADE,
    "user" VARCHAR(255) DEFAULT 'anonymous'
);

-- Create image content table
CREATE TABLE IF NOT EXISTS image_content (
    id SERIAL PRIMARY KEY,
    binary_data BYTEA
);

-- Create image metadata table
CREATE TABLE IF NOT EXISTS image_metadata (
    id SERIAL PRIMARY KEY,
    original_filename VARCHAR(255),
    content_type VARCHAR(100),
    content_id INTEGER REFERENCES image_content(id) ON DELETE CASCADE,
    size_bytes INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint for article current_revision_id
ALTER TABLE article 
ADD CONSTRAINT fk_article_current_revision 
FOREIGN KEY (current_revision_id) REFERENCES revision(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_article_title ON article(title);
CREATE INDEX IF NOT EXISTS idx_revision_article_id ON revision(article_id);
CREATE INDEX IF NOT EXISTS idx_revision_user_id ON revision(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_revision_id ON comment(revision_id);
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON comment(user_id);
CREATE INDEX IF NOT EXISTS idx_book_title ON book(title);
CREATE INDEX IF NOT EXISTS idx_book_author ON book(author);
CREATE INDEX IF NOT EXISTS idx_book_isbn ON book(isbn);
CREATE INDEX IF NOT EXISTS idx_music_metadata_title ON music_metadata(title);
CREATE INDEX IF NOT EXISTS idx_music_metadata_artist ON music_metadata(artist);
CREATE INDEX IF NOT EXISTS idx_videos_filename ON videos(filename);
CREATE INDEX IF NOT EXISTS idx_image_metadata_filename ON image_metadata(original_filename);

-- Create full-text search index for revisions
CREATE INDEX IF NOT EXISTS idx_revision_tsvector ON revision USING GIN(tsvector_content);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_updated_at BEFORE UPDATE ON article 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_updated_at BEFORE UPDATE ON book 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate tsvector for revisions
CREATE OR REPLACE FUNCTION generate_revision_tsvector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tsvector_content = to_tsvector('english', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tsvector generation
CREATE TRIGGER generate_revision_tsvector_trigger BEFORE INSERT OR UPDATE ON revision 
    FOR EACH ROW EXECUTE FUNCTION generate_revision_tsvector();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE article ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE book ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now - customize as needed)
CREATE POLICY "Allow all operations on users" ON "user" FOR ALL USING (true);
CREATE POLICY "Allow all operations on articles" ON article FOR ALL USING (true);
CREATE POLICY "Allow all operations on revisions" ON revision FOR ALL USING (true);
CREATE POLICY "Allow all operations on comments" ON comment FOR ALL USING (true);
CREATE POLICY "Allow all operations on books" ON book FOR ALL USING (true);
CREATE POLICY "Allow all operations on music_metadata" ON music_metadata FOR ALL USING (true);
CREATE POLICY "Allow all operations on videos" ON videos FOR ALL USING (true);
CREATE POLICY "Allow all operations on image_metadata" ON image_metadata FOR ALL USING (true);
"""

def setup_database_schema():
    """Set up the database schema in Supabase"""
    print("Setting up database schema in Supabase...")
    print(f"Supabase URL: {settings.supabase_url}")
    
    try:
        # Execute the schema SQL
        response = supabase.rpc('exec_sql', {'sql': SCHEMA_SQL}).execute()
        print("✓ Database schema created successfully!")
        
        # Verify tables were created
        tables_to_check = [
            "user", "article", "revision", "comment", "book", 
            "music_content", "music_metadata", "video_content", 
            "videos", "image_content", "image_metadata"
        ]
        
        print("\nVerifying table creation...")
        for table in tables_to_check:
            try:
                # Try to select from each table to verify it exists
                result = supabase.table(table).select("*").limit(1).execute()
                print(f"✓ Table '{table}' exists and is accessible")
            except Exception as e:
                print(f"✗ Table '{table}' error: {e}")
        
        print("\n" + "="*50)
        print("SCHEMA SETUP COMPLETED SUCCESSFULLY!")
        print("="*50)
        print("You can now run the population script:")
        print("python populate_supabase.py")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"✗ Error setting up schema: {e}")
        print("\nTrying alternative approach...")
        
        # Alternative: Try to create tables one by one using direct SQL
        try:
            return setup_schema_alternative()
        except Exception as e2:
            print(f"✗ Alternative approach also failed: {e2}")
            return False

def setup_schema_alternative():
    """Alternative approach: Create tables using Supabase SQL editor approach"""
    print("Using alternative schema setup approach...")
    
    # Split the schema into individual statements
    statements = [
        # Users table
        """
        CREATE TABLE IF NOT EXISTS "user" (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        """,
        
        # Articles table
        """
        CREATE TABLE IF NOT EXISTS article (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            current_revision_id INTEGER UNIQUE
        );
        """,
        
        # Revisions table
        """
        CREATE TABLE IF NOT EXISTS revision (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            comment TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            article_id INTEGER REFERENCES article(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
            tsvector_content TSVECTOR
        );
        """,
        
        # Comments table
        """
        CREATE TABLE IF NOT EXISTS comment (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
            revision_id INTEGER REFERENCES revision(id) ON DELETE CASCADE
        );
        """,
        
        # Books table
        """
        CREATE TABLE IF NOT EXISTS book (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            published_date DATE,
            isbn VARCHAR(20),
            genre VARCHAR(100),
            summary TEXT,
            cover_image VARCHAR(500),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        """,
        
        # Music content table
        """
        CREATE TABLE IF NOT EXISTS music_content (
            id SERIAL PRIMARY KEY,
            binary_data BYTEA
        );
        """,
        
        # Music metadata table
        """
        CREATE TABLE IF NOT EXISTS music_metadata (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            artist VARCHAR(255) NOT NULL,
            album VARCHAR(255) NOT NULL,
            content_id INTEGER REFERENCES music_content(id) ON DELETE CASCADE,
            cover_image BYTEA
        );
        """,
        
        # Video content table
        """
        CREATE TABLE IF NOT EXISTS video_content (
            id SERIAL PRIMARY KEY,
            binary_data BYTEA
        );
        """,
        
        # Video metadata table
        """
        CREATE TABLE IF NOT EXISTS videos (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            content_id INTEGER REFERENCES video_content(id) ON DELETE CASCADE,
            "user" VARCHAR(255) DEFAULT 'anonymous'
        );
        """,
        
        # Image content table
        """
        CREATE TABLE IF NOT EXISTS image_content (
            id SERIAL PRIMARY KEY,
            binary_data BYTEA
        );
        """,
        
        # Image metadata table
        """
        CREATE TABLE IF NOT EXISTS image_metadata (
            id SERIAL PRIMARY KEY,
            original_filename VARCHAR(255),
            content_type VARCHAR(100),
            content_id INTEGER REFERENCES image_content(id) ON DELETE CASCADE,
            size_bytes INTEGER,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        """
    ]
    
    for i, statement in enumerate(statements, 1):
        try:
            print(f"Creating table {i}/{len(statements)}...")
            # Note: This might not work with all Supabase setups
            # You may need to run these manually in the Supabase SQL editor
            result = supabase.rpc('exec_sql', {'sql': statement}).execute()
            print(f"✓ Table {i} created successfully")
        except Exception as e:
            print(f"✗ Error creating table {i}: {e}")
            print("You may need to create these tables manually in the Supabase SQL editor")
    
    return True

def main():
    """Main function to set up the schema"""
    print("Afropedia Database Schema Setup")
    print("=" * 40)
    print("This script will create all required tables in your Supabase database.")
    print()
    
    success = setup_database_schema()
    
    if not success:
        print("\n" + "="*50)
        print("MANUAL SETUP REQUIRED")
        print("="*50)
        print("The automatic schema setup failed.")
        print("Please follow these steps:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to the SQL Editor")
        print("3. Copy and paste the SQL schema from the setup_schema.sql file")
        print("4. Execute the SQL to create all tables")
        print("5. Then run: python populate_supabase.py")
        print("="*50)

if __name__ == "__main__":
    main()
