#!/usr/bin/env python3
"""
Initialize MeiliSearch indexes and populate them with data
"""
import asyncio
import os
import sys
import time
from search_service import search_service

async def wait_for_meilisearch(max_retries=30, delay=2):
    """Wait for MeiliSearch to be available"""
    print("Waiting for MeiliSearch to start...")
    
    for i in range(max_retries):
        try:
            # Try to get MeiliSearch health
            health = search_service.client.health()
            if health.get('status') == 'available':
                print("✅ MeiliSearch is ready!")
                return True
        except Exception as e:
            print(f"Attempt {i+1}/{max_retries}: MeiliSearch not ready yet ({e})")
            time.sleep(delay)
    
    print("❌ MeiliSearch failed to start within timeout")
    return False

async def initialize_meilisearch():
    """Initialize MeiliSearch indexes and populate with data"""
    print("🚀 Initializing MeiliSearch...")
    
    # Wait for MeiliSearch to be ready
    if not await wait_for_meilisearch():
        print("❌ Cannot initialize MeiliSearch - service not available")
        return False
    
    try:
        # Initialize indexes
        print("📝 Creating MeiliSearch indexes...")
        await search_service.initialize_indexes()
        
        # Index articles
        print("📚 Indexing articles...")
        articles_success = await search_service.index_articles()
        if articles_success:
            print("✅ Articles indexed successfully")
        else:
            print("❌ Failed to index articles")
        
        # Index books
        print("📖 Indexing books...")
        books_success = await search_service.index_books()
        if books_success:
            print("✅ Books indexed successfully")
        else:
            print("❌ Failed to index books")
        
        if articles_success and books_success:
            print("🎉 MeiliSearch initialization complete!")
            return True
        else:
            print("⚠️  MeiliSearch initialization completed with some errors")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing MeiliSearch: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(initialize_meilisearch())
    sys.exit(0 if success else 1)
