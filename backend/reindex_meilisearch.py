#!/usr/bin/env python3
"""
Reindex MeiliSearch with current database content
"""
import asyncio
import os
import sys
from search_service import search_service

async def reindex_meilisearch():
    """Clear and reindex MeiliSearch with current database content"""
    print("🔄 Reindexing MeiliSearch...")
    
    try:
        # 1. Initialize indexes (this will clear existing data)
        print("📝 Initializing MeiliSearch indexes...")
        await search_service.initialize_indexes()
        
        # 2. Index articles
        print("📚 Indexing articles...")
        articles_success = await search_service.index_articles()
        if articles_success:
            print("✅ Articles indexed successfully")
        else:
            print("❌ Failed to index articles")
        
        # 3. Index books
        print("📖 Indexing books...")
        books_success = await search_service.index_books()
        if books_success:
            print("✅ Books indexed successfully")
        else:
            print("❌ Failed to index books")
        
        if articles_success and books_success:
            print("\n🎉 MeiliSearch reindexing completed successfully!")
            return True
        else:
            print("\n⚠️  MeiliSearch reindexing completed with some errors")
            return False
            
    except Exception as e:
        print(f"❌ Error reindexing MeiliSearch: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(reindex_meilisearch())
    sys.exit(0 if success else 1)
