#!/usr/bin/env python3
"""
Simple database reset with admin account and project article
"""
import asyncio
import os
import sys
from supabase_client import supabase
from auth.security import get_password_hash

async def reset_database():
    """Reset database with admin account and project article"""
    print("🔄 Resetting database with admin account and project article...")
    
    try:
        # 1. Create admin user
        print("👤 Creating admin user...")
        admin_data = {
            "username": "admin",
            "email": "admin@afropedia.org",
            "hashed_password": get_password_hash("admin123"),
            "role": "admin",
            "is_active": True,
            "reputation_score": 1000
        }
        
        # Insert admin user
        admin_result = supabase.table("user").insert(admin_data).execute()
        if admin_result.data:
            admin_id = admin_result.data[0]["id"]
            print(f"✅ Admin user created with ID: {admin_id}")
        else:
            print("❌ Failed to create admin user")
            return False
        
        # 2. Create Afropedia project article
        print("📝 Creating Afropedia project article...")
        article_data = {
            "title": "Afropedia_Project",
            "content": """# Afropedia: A Comprehensive Knowledge Platform for African Content

## Overview
Afropedia is a comprehensive knowledge platform dedicated to preserving, sharing, and celebrating African heritage, history, culture, and contemporary achievements. Built as a Wikipedia-style platform, it serves as a centralized repository for African knowledge that is accessible, reliable, and community-driven.

## Mission
Our mission is to create the world's most comprehensive and accessible digital encyclopedia of African knowledge, ensuring that African stories, histories, and contributions are properly documented and celebrated.

## Key Features

### 1. **Multi-Format Content**
- **Articles**: In-depth written content on various topics
- **Books**: Digital library of African literature and academic works
- **Music**: Audio content showcasing African musical traditions
- **Videos**: Visual content including documentaries and cultural performances
- **Images**: Photographic documentation of African life and heritage

### 2. **Peer Review System**
- Community-driven content verification
- Expert review process for accuracy and quality
- Collaborative editing with revision tracking
- Quality assurance through multiple review stages

### 3. **Advanced Search**
- MeiliSearch-powered intelligent search
- Fuzzy matching and typo tolerance
- Cross-content search across all media types
- Intelligent suggestions and auto-complete

### 4. **Moderation & Governance**
- Role-based access control (Admin, Moderator, Editor, User)
- Content flagging and review system
- Community guidelines enforcement
- Transparent moderation processes

### 5. **User Engagement**
- User profiles with reputation scoring
- Contribution tracking and recognition
- Community discussions and comments
- Notification system for updates

## Technical Architecture

### Backend
- **FastAPI**: High-performance Python web framework
- **Supabase**: PostgreSQL database with real-time capabilities
- **MeiliSearch**: Lightning-fast search engine
- **Railway**: Cloud deployment platform

### Frontend
- **Next.js**: React-based web framework
- **Chakra UI**: Modern, accessible component library
- **TypeScript**: Type-safe development
- **Vercel**: Global CDN deployment

## Getting Started

### For Readers
1. Browse content by category or search
2. Create an account to save favorites
3. Participate in discussions and comments
4. Suggest improvements and corrections

### For Contributors
1. Register for an account
2. Start with small edits and contributions
3. Build reputation through quality contributions
4. Apply for editor status after meeting criteria

## Contact & Support

- **Website**: [https://afropedia-one.vercel.app](https://afropedia-one.vercel.app)
- **Email**: admin@afropedia.org
- **Community**: Join our discussion forums

---

*This article serves as the central documentation for the Afropedia project.*""",
            "summary": "Afropedia is a comprehensive knowledge platform dedicated to preserving, sharing, and celebrating African heritage, history, culture, and contemporary achievements.",
            "category": "Project Documentation",
            "tags": ["afropedia", "africa", "knowledge", "platform", "documentation"],
            "status": "published"
        }
        
        # Insert article
        article_result = supabase.table("article").insert(article_data).execute()
        if article_result.data:
            article_id = article_result.data[0]["id"]
            print(f"✅ Article created with ID: {article_id}")
        else:
            print("❌ Failed to create article")
            return False
        
        # 3. Create initial revision for the article
        print("📋 Creating initial revision...")
        revision_data = {
            "article_id": article_id,
            "user_id": admin_id,
            "content": article_data["content"],
            "summary": "Initial version of the Afropedia project documentation",
            "status": "approved"
        }
        
        revision_result = supabase.table("revision").insert(revision_data).execute()
        if revision_result.data:
            revision_id = revision_result.data[0]["id"]
            print(f"✅ Initial revision created with ID: {revision_id}")
        else:
            print("❌ Failed to create revision")
            return False
        
        print("\n🎉 Database reset completed successfully!")
        print("\n📋 Summary:")
        print(f"   👤 Admin user: admin@afropedia.org (password: admin123)")
        print(f"   📝 Article: Afropedia_Project")
        print(f"   🔗 Frontend: https://afropedia-one.vercel.app")
        print(f"   🔗 Backend: https://afropediabackend-production.up.railway.app")
        
        return True
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(reset_database())
    sys.exit(0 if success else 1)
