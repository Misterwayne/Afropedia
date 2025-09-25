#!/usr/bin/env python3
"""
Setup script for MeiliSearch integration
This script will:
1. Check if MeiliSearch is running
2. Initialize the search indexes
3. Index existing content
"""

import asyncio
import subprocess
import time
import requests
from search_service import search_service

def check_meilisearch_running():
    """Check if MeiliSearch is running"""
    try:
        response = requests.get(f"{search_service.meili_url}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def start_meilisearch():
    """Start MeiliSearch using Docker"""
    try:
        print("🐳 Starting MeiliSearch with Docker...")
        subprocess.run([
            "docker", "run", "-d",
            "--name", "meilisearch",
            "-p", "7700:7700",
            "-e", "MEILI_MASTER_KEY=masterKey",
            "getmeili/meilisearch:latest"
        ], check=True)
        
        print("⏳ Waiting for MeiliSearch to start...")
        time.sleep(10)
        
        if check_meilisearch_running():
            print("✅ MeiliSearch started successfully!")
            return True
        else:
            print("❌ MeiliSearch failed to start")
            return False
            
    except subprocess.CalledProcessError:
        print("❌ Failed to start MeiliSearch with Docker")
        return False
    except FileNotFoundError:
        print("❌ Docker not found. Please install Docker or start MeiliSearch manually")
        return False

async def setup_search():
    """Setup MeiliSearch indexes and content"""
    print("🔍 Setting up MeiliSearch...")
    
    # Check if MeiliSearch is running
    if not check_meilisearch_running():
        print("MeiliSearch is not running. Attempting to start...")
        if not start_meilisearch():
            print("❌ Could not start MeiliSearch. Please start it manually:")
            print("   docker run -d --name meilisearch -p 7700:7700 -e MEILI_MASTER_KEY=masterKey getmeili/meilisearch:latest")
            return False
    
    try:
        # Initialize indexes
        print("📋 Initializing search indexes...")
        await search_service.initialize_indexes()
        
        # Index articles
        print("📚 Indexing articles...")
        await search_service.index_articles()
        
        # Index books
        print("📖 Indexing books...")
        await search_service.index_books()
        
        print("✅ MeiliSearch setup completed successfully!")
        print(f"🌐 MeiliSearch dashboard: {search_service.meili_url}")
        print(f"🔑 Master key: {search_service.meili_key}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up MeiliSearch: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(setup_search())
