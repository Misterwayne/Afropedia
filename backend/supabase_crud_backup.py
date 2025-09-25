#!/usr/bin/env python3
"""
Supabase-compatible CRUD operations
"""

from supabase_client import supabase
from models import Article, ArticleCreate, ArticleRead, Book, BookCreate, BookRead, User
from typing import List, Optional
from datetime import datetime

# Article operations
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

async def get_article_by_title_supabase(title: str) -> Optional[Article]:
    """Get article by title from Supabase"""
    try:
        result = supabase.table("article").select("*").eq("title", title).execute()
        if result.data:
            article_data = result.data[0]
            return Article(
                id=article_data["id"],
                title=article_data["title"],
                created_at=article_data["created_at"],
                updated_at=article_data["updated_at"],
                current_revision_id=article_data.get("current_revision_id")
            )
        return None
    except Exception as e:
        print(f"Error getting article by title: {e}")
        return None

async def create_article_supabase(article_data: ArticleCreate, user_id: int) -> Optional[Article]:
    """Create article in Supabase"""
    try:
        # Create article
        article_result = supabase.table("article").insert({
            "title": article_data.title,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if not article_result.data:
            return None
            
        article = article_result.data[0]
        article_id = article["id"]
        
        # Create revision
        revision_result = supabase.table("revision").insert({
            "content": article_data.content,
            "comment": article_data.comment,
            "article_id": article_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
        
        if not revision_result.data:
            return None
            
        revision = revision_result.data[0]
        revision_id = revision["id"]
        
        # Update article with current revision
        supabase.table("article").update({
            "current_revision_id": revision_id
        }).eq("id", article_id).execute()
        
        return Article(
            id=article["id"],
            title=article["title"],
            created_at=article["created_at"],
            updated_at=article["updated_at"],
            current_revision_id=revision_id
        )
    except Exception as e:
        print(f"Error creating article: {e}")
        return None

# Book operations
async def get_books_supabase(skip: int = 0, limit: int = 100) -> List[BookRead]:
    """Get books from Supabase"""
    try:
        result = supabase.table("book").select("*").range(skip, skip + limit - 1).execute()
        books = []
        for book_data in result.data:
            books.append(BookRead(
                id=book_data["id"],
                title=book_data["title"],
                author=book_data["author"],
                published_date=book_data.get("published_date"),
                isbn=book_data.get("isbn"),
                genre=book_data.get("genre"),
                summary=book_data.get("summary"),
                cover_image=book_data.get("cover_image"),
                created_at=book_data["created_at"],
                updated_at=book_data["updated_at"]
            ))
        return books
    except Exception as e:
        print(f"Error getting books: {e}")
        return []

async def create_book_supabase(book_data: BookCreate) -> Optional[Book]:
    """Create book in Supabase"""
    try:
        result = supabase.table("book").insert({
            "title": book_data.title,
            "author": book_data.author,
            "published_date": book_data.published_date.isoformat() if book_data.published_date else None,
            "isbn": book_data.isbn,
            "genre": book_data.genre,
            "summary": book_data.summary,
            "cover_image": book_data.cover_image,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            book_data = result.data[0]
            return Book(
                id=book_data["id"],
                title=book_data["title"],
                author=book_data["author"],
                published_date=book_data["published_date"],
                isbn=book_data["isbn"],
                genre=book_data["genre"],
                summary=book_data["summary"],
                cover_image=book_data["cover_image"],
                created_at=book_data["created_at"],
                updated_at=book_data["updated_at"]
            )
        return None
    except Exception as e:
        print(f"Error creating book: {e}")
        return None
