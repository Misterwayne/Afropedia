#!/usr/bin/env python3
"""
Fixed Supabase CRUD with proper revision loading
"""

from supabase_client import supabase
from models import Article, ArticleCreate, ArticleRead, Book, BookCreate, BookRead, User, Revision
from typing import List, Optional
from datetime import datetime

async def get_article_by_title_supabase(title: str) -> Optional[Article]:
    """Get article by title from Supabase WITH revision data"""
    try:
        # Get article
        article_result = supabase.table("article").select("*").eq("title", title).execute()
        if not article_result.data:
            return None
            
        article_data = article_result.data[0]
        
        # Get current revision if it exists
        current_revision = None
        if article_data.get("current_revision_id"):
            revision_result = supabase.table("revision").select("*").eq("id", article_data["current_revision_id"]).execute()
            if revision_result.data:
                rev_data = revision_result.data[0]
                
                # Get user for revision
                user = None
                if rev_data.get("user_id"):
                    user_result = supabase.table("user").select("*").eq("id", rev_data["user_id"]).execute()
                    if user_result.data:
                        user_data = user_result.data[0]
                        user = User(
                            id=user_data["id"],
                            username=user_data["username"],
                            email=user_data["email"],
                            hashed_password=user_data["hashed_password"],
                            created_at=user_data["created_at"],
                            updated_at=user_data["updated_at"]
                        )
                
                current_revision = Revision(
                    id=rev_data["id"],
                    content=rev_data["content"],
                    comment=rev_data.get("comment"),
                    timestamp=rev_data["timestamp"],
                    article_id=rev_data["article_id"],
                    user_id=rev_data.get("user_id"),
                    tsvector_content=rev_data.get("tsvector_content"),
                    user=user
                )
        
        article = Article(
            id=article_data["id"],
            title=article_data["title"],
            created_at=article_data["created_at"],
            updated_at=article_data["updated_at"],
            current_revision_id=article_data.get("current_revision_id"),
            currentRevision=current_revision
        )
        
        return article
    except Exception as e:
        print(f"Error getting article by title: {e}")
        return None

# Keep other functions the same
async def get_articles_supabase(skip: int = 0, limit: int = 100) -> List[ArticleRead]:
    """Get articles from Supabase"""
    try:
        result = supabase.table("article").select("*").range(skip, skip + limit - 1).execute()
        articles = []
        for article_data in result.data:
            articles.append(ArticleRead(
                id=article_data["id"],
                title=article_data["title"],
                created_at=article_data["created_at"],
                updated_at=article_data["updated_at"]
            ))
        return articles
    except Exception as e:
        print(f"Error getting articles: {e}")
        return []
