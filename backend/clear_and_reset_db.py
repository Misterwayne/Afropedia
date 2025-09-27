#!/usr/bin/env python3
"""
Clear database and reset with admin account and Afropedia project article
"""
import asyncio
import os
import sys
from supabase_client import supabase
from auth.security import get_password_hash

async def clear_and_reset_database():
    """Clear all data and reset with admin account and project article"""
    print("🗑️  Clearing database...")
    
    try:
        # 1. Clear all data in correct dependency order
        print("   Clearing sources...")
        supabase.table("source").delete().neq("id", 0).execute()
        
        print("   Clearing comments...")
        supabase.table("comment").delete().neq("id", 0).execute()
        
        print("   Clearing revisions...")
        supabase.table("revision").delete().neq("id", 0).execute()
        
        print("   Clearing articles...")
        supabase.table("article").delete().neq("id", 0).execute()
        
        print("   Clearing books...")
        supabase.table("book").delete().neq("id", 0).execute()
        
        print("   Clearing music metadata...")
        supabase.table("music_metadata").delete().neq("id", 0).execute()
        
        print("   Clearing videos...")
        supabase.table("videos").delete().neq("id", 0).execute()
        
        print("   Clearing image metadata...")
        supabase.table("image_metadata").delete().neq("id", 0).execute()
        
        print("   Clearing users...")
        supabase.table("user").delete().neq("id", 0).execute()
        
        print("✅ Database cleared successfully!")
        
        # 2. Create admin user
        print("\n👤 Creating admin user...")
        admin_data = {
            "username": "admin",
            "email": "admin@afropedia.org",
            "hashed_password": get_password_hash("admin123"),
            "role": "admin",
            "is_active": True,
            "reputation_score": 1000
        }
        
        admin_result = supabase.table("user").insert(admin_data).execute()
        if admin_result.data:
            admin_id = admin_result.data[0]["id"]
            print(f"✅ Admin user created with ID: {admin_id}")
        else:
            print("❌ Failed to create admin user")
            return False
        
        # 3. Create Afropedia project article
        print("\n📝 Creating Afropedia project article...")
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

## Content Categories

### History & Heritage
- Ancient African civilizations
- Colonial and post-colonial periods
- Independence movements
- Historical figures and events

### Culture & Arts
- Traditional and contemporary arts
- Music and dance traditions
- Literature and oral traditions
- Festivals and celebrations

### Geography & Environment
- African landscapes and ecosystems
- Climate and environmental issues
- Urban and rural development
- Natural resources and conservation

### Science & Technology
- African contributions to science
- Traditional knowledge systems
- Modern technological innovations
- Research and development

### Society & Politics
- Social structures and organizations
- Political systems and governance
- Social movements and activism
- Contemporary social issues

## Community Guidelines

### Content Standards
- Accuracy and verifiability
- Neutral point of view
- Original research and citations
- Respectful and inclusive language

### Contribution Guidelines
- Cite reliable sources
- Follow established formatting
- Engage constructively with others
- Respect copyright and intellectual property

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

### For Administrators
1. Access moderation dashboard
2. Review flagged content
3. Manage user roles and permissions
4. Oversee community guidelines

## Future Roadmap

### Phase 1: Foundation (Current)
- ✅ Core platform development
- ✅ User authentication and roles
- ✅ Basic content management
- ✅ Search functionality

### Phase 2: Enhancement
- 🔄 Advanced peer review system
- 🔄 Mobile application
- 🔄 API for third-party integrations
- 🔄 Multilingual support

### Phase 3: Expansion
- 📋 AI-powered content suggestions
- 📋 Advanced analytics and insights
- 📋 Educational partnerships
- 📋 International collaboration tools

## Contact & Support

- **Website**: [https://afropedia-one.vercel.app](https://afropedia-one.vercel.app)
- **Email**: admin@afropedia.org
- **Community**: Join our discussion forums
- **Documentation**: Available in the help section

## Acknowledgments

Afropedia is built by a dedicated community of developers, researchers, educators, and African knowledge enthusiasts. We thank all contributors who help make this platform a valuable resource for African knowledge and heritage.

---

*This article serves as the central documentation for the Afropedia project. It will be updated as the platform evolves and grows.*""",
            "summary": "Afropedia is a comprehensive knowledge platform dedicated to preserving, sharing, and celebrating African heritage, history, culture, and contemporary achievements. This article documents the project's mission, features, technical architecture, and community guidelines.",
            "category": "Project Documentation",
            "tags": ["afropedia", "africa", "knowledge", "platform", "documentation", "project"],
            "status": "published"
        }
        
        article_result = supabase.table("article").insert(article_data).execute()
        if article_result.data:
            article_id = article_result.data[0]["id"]
            print(f"✅ Article created with ID: {article_id}")
        else:
            print("❌ Failed to create article")
            return False
        
        # 4. Create initial revision for the article
        print("\n📋 Creating initial revision...")
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
        
        # 5. Create a sample book about African history
        print("\n📚 Creating sample book...")
        book_data = {
            "title": "Introduction to African History",
            "author": "Dr. Kwame Nkrumah",
            "description": "A comprehensive introduction to African history from ancient times to the present day, covering major civilizations, events, and cultural developments across the continent.",
            "published_year": 2024,
            "isbn": "978-0-123456-78-9",
            "category": "History",
            "tags": ["history", "africa", "civilization", "culture"],
            "status": "published"
        }
        
        book_result = supabase.table("book").insert(book_data).execute()
        if book_result.data:
            book_id = book_result.data[0]["id"]
            print(f"✅ Sample book created with ID: {book_id}")
        else:
            print("❌ Failed to create sample book")
            return False
        
        print("\n🎉 Database reset completed successfully!")
        print("\n📋 Summary:")
        print(f"   👤 Admin user: admin@afropedia.org (password: admin123)")
        print(f"   📝 Article: Afropedia_Project")
        print(f"   📚 Book: Introduction to African History")
        print(f"   🔗 Frontend: https://afropedia-one.vercel.app")
        print(f"   🔗 Backend: https://afropediabackend-production.up.railway.app")
        
        return True
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(clear_and_reset_database())
    sys.exit(0 if success else 1)
