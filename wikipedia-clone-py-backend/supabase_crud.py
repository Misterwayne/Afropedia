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
        
        # Get user for revision
        user_result = supabase.table("user").select("*").eq("id", user_id).execute()
        user = None
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
            id=revision["id"],
            content=revision["content"],
            comment=revision.get("comment"),
            timestamp=revision["timestamp"],
            article_id=revision["article_id"],
            user_id=revision["user_id"],
            tsvector_content=revision.get("tsvector_content"),
            user=user
        )
        
        return Article(
            id=article["id"],
            title=article["title"],
            created_at=article["created_at"],
            updated_at=article["updated_at"],
            current_revision_id=revision_id,
            currentRevision=current_revision
        )
    except Exception as e:
        print(f"Error creating article: {e}")
        return None

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

async def get_book_by_id_supabase(book_id: int) -> Optional[Book]:
    """Get book by ID from Supabase"""
    try:
        result = supabase.table("book").select("*").eq("id", book_id).execute()
        if result.data:
            book_data = result.data[0]
            return Book(
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
            )
        return None
    except Exception as e:
        print(f"Error getting book by ID: {e}")
        return None

async def update_book_supabase(book_id: int, book_update: dict) -> Optional[Book]:
    """Update book in Supabase"""
    try:
        result = supabase.table("book").update(book_update).eq("id", book_id).execute()
        if result.data:
            return await get_book_by_id_supabase(book_id)
        return None
    except Exception as e:
        print(f"Error updating book: {e}")
        return None

async def delete_book_supabase(book_id: int) -> bool:
    """Delete book from Supabase"""
    try:
        result = supabase.table("book").delete().eq("id", book_id).execute()
        return bool(result.data)
    except Exception as e:
        print(f"Error deleting book: {e}")
        return False

# Music operations
async def get_all_music_metadata_supabase(skip: int = 0, limit: int = 100):
    """Get all music metadata from Supabase"""
    try:
        result = supabase.table("music_metadata").select("*").range(skip, skip + limit - 1).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting music metadata: {e}")
        return []

async def get_music_metadata_by_id_supabase(music_id: int):
    """Get music metadata by ID from Supabase"""
    try:
        result = supabase.table("music_metadata").select("*").eq("id", music_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error getting music metadata by ID: {e}")
        return None

async def get_music_content_by_id_supabase(content_id: int):
    """Get music content by content ID from Supabase"""
    try:
        result = supabase.table("music_content").select("binary_data").eq("id", content_id).execute()
        if result.data:
            binary_data = result.data[0]["binary_data"]
            # Convert string to bytes if needed (same as image processing)
            if isinstance(binary_data, str):
                import base64
                # Add padding if needed
                missing_padding = len(binary_data) % 4
                if missing_padding:
                    binary_data += '=' * (4 - missing_padding)
                binary_data = base64.b64decode(binary_data)
            return binary_data
        return None
    except Exception as e:
        print(f"Error getting music content: {e}")
        return None

async def create_music_content_supabase(binary_data: bytes):
    """Create music content in Supabase"""
    try:
        # Convert binary data to base64 string for storage
        import base64
        binary_data_b64 = base64.b64encode(binary_data).decode('utf-8')
        
        result = supabase.table("music_content").insert({
            "binary_data": binary_data_b64
        }).execute()
        
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating music content: {e}")
        return None

async def create_music_metadata_supabase(content_id: int, title: str, artist: str, album: str, cover_image: bytes = None):
    """Create music metadata in Supabase"""
    try:
        metadata_data = {
            "content_id": content_id,
            "title": title,
            "artist": artist,
            "album": album
        }
        
        # Add cover image if provided
        if cover_image:
            import base64
            cover_image_b64 = base64.b64encode(cover_image).decode('utf-8')
            metadata_data["cover_image"] = cover_image_b64
        
        result = supabase.table("music_metadata").insert(metadata_data).execute()
        
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating music metadata: {e}")
        return None

async def create_video_content_supabase(binary_data: bytes):
    """Create video content in Supabase"""
    try:
        # Convert binary data to base64 string for storage
        import base64
        binary_data_b64 = base64.b64encode(binary_data).decode('utf-8')
        
        result = supabase.table("video_content").insert({
            "binary_data": binary_data_b64
        }).execute()
        
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating video content: {e}")
        return None

async def create_video_metadata_supabase(content_id: int, filename: str, timestamp: str):
    """Create video metadata in Supabase"""
    try:
        metadata_data = {
            "content_id": content_id,
            "filename": filename,
            "timestamp": timestamp
        }
        
        result = supabase.table("videos").insert(metadata_data).execute()
        
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating video metadata: {e}")
        return None

# Video operations
async def get_all_video_metadata_supabase(skip: int = 0, limit: int = 100):
    """Get all video metadata from Supabase"""
    try:
        result = supabase.table("videos").select("*").range(skip, skip + limit - 1).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting video metadata: {e}")
        return []

async def get_video_metadata_by_id_supabase(video_id: int):
    """Get video metadata by ID from Supabase"""
    try:
        result = supabase.table("videos").select("*").eq("id", video_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error getting video metadata by ID: {e}")
        return None

async def get_video_content_by_id_supabase(content_id: int):
    """Get video content by content ID from Supabase"""
    try:
        result = supabase.table("video_content").select("binary_data").eq("id", content_id).execute()
        if result.data:
            binary_data = result.data[0]["binary_data"]
            # Convert string to bytes if needed (same as image processing)
            if isinstance(binary_data, str):
                import base64
                # Add padding if needed
                missing_padding = len(binary_data) % 4
                if missing_padding:
                    binary_data += '=' * (4 - missing_padding)
                binary_data = base64.b64decode(binary_data)
            return binary_data
        return None
    except Exception as e:
        print(f"Error getting video content: {e}")
        return None

# Search operations
async def search_articles_fts_supabase(query: str):
    """Performs full-text search on current revisions using Supabase"""
    if not query.strip():
        return []
    
    try:
        # Use Supabase's full-text search capabilities
        # This uses PostgreSQL's full-text search via Supabase RPC or direct query
        result = supabase.rpc('search_articles_fts', {'search_query': query.strip()}).execute()
        return result.data or []
    except Exception as e:
        print(f"Error in full-text search: {e}")
        # Fallback to simple title/content search if RPC not available
        try:
            # Simple fallback using ilike search on title and content
            result = supabase.table("article").select("""
                id, title,
                revision!inner(content)
            """).ilike("title", f"%{query}%").limit(20).execute()
            
            fallback_results = []
            for article in result.data or []:
                fallback_results.append({
                    "id": article["id"],
                    "title": article["title"],
                    "rank": 1.0,  # Default rank
                    "snippet": article["revision"][0]["content"][:200] + "..." if article["revision"] else ""
                })
            return fallback_results
        except Exception as fallback_error:
            print(f"Error in fallback search: {fallback_error}")
            return []

async def suggest_article_titles_supabase(query: str):
    """Suggests article titles starting with the query using Supabase"""
    if not query.strip() or len(query) < 2:
        return []
    
    try:
        normalized_query = query.strip().replace(" ", "_")
        result = supabase.table("article").select("title").ilike("title", f"{normalized_query}%").order("title").limit(10).execute()
        return [article["title"] for article in result.data or []]
    except Exception as e:
        print(f"Error suggesting titles: {e}")
        return []

# Image operations
async def create_image_content_supabase(binary_data: bytes) -> Optional[dict]:
    """Create image content in Supabase"""
    try:
        # Convert binary data to base64 for Supabase storage
        import base64
        binary_data_b64 = base64.b64encode(binary_data).decode('utf-8')
        
        result = supabase.table("image_content").insert({
            "binary_data": binary_data_b64
        }).execute()
        
        if result.data:
            print(f"[CRUD Image] Created ImageContent with ID: {result.data[0]['id']}")
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating image content: {e}")
        return None

async def create_image_metadata_supabase(
    content_id: int,
    original_filename: str,
    content_type: str,
    size_bytes: int
) -> Optional[dict]:
    """Create image metadata in Supabase"""
    try:
        result = supabase.table("image_metadata").insert({
            "original_filename": original_filename,
            "content_type": content_type,
            "content_id": content_id,
            "size_bytes": size_bytes,
            "uploaded_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            print(f"[CRUD Image] Successfully created ImageMetadata ID: {result.data[0]['id']}")
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating image metadata: {e}")
        return None

# Image retrieval operations
async def get_image_metadata_by_id_supabase(metadata_id: int):
    """Get image metadata by ID from Supabase"""
    try:
        result = supabase.table("image_metadata").select("*").eq("id", metadata_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error getting image metadata: {e}")
        return None

async def get_image_content_by_metadata_id_supabase(metadata_id: int):
    """Get image content by metadata ID from Supabase"""
    try:
        # First get metadata to find content_id
        metadata_result = supabase.table("image_metadata").select("content_id").eq("id", metadata_id).execute()
        if not metadata_result.data:
            return None
            
        content_id = metadata_result.data[0]["content_id"]
        
        # Then get the actual content
        content_result = supabase.table("image_content").select("binary_data").eq("id", content_id).execute()
        if content_result.data:
            binary_data = content_result.data[0]["binary_data"]
            # Convert string to bytes if needed (Supabase returns BYTEA as hex-encoded base64)
            if isinstance(binary_data, str):
                # The data is hex encoded with literal \x prefix, convert it
                if binary_data.startswith('\\x'):
                    # Remove the literal \x prefix and convert from hex
                    hex_string = binary_data[2:]  # Remove \x prefix
                    binary_data = bytes.fromhex(hex_string)
                    
                    # Now the data is base64 encoded, decode it
                    import base64
                    # Add padding if needed
                    b64_string = binary_data.decode('ascii')
                    missing_padding = len(b64_string) % 4
                    if missing_padding:
                        b64_string += '=' * (4 - missing_padding)
                    binary_data = base64.b64decode(b64_string)
                else:
                    # Fallback: assume it's raw bytes as string
                    binary_data = binary_data.encode('latin-1')
            return {"binary_data": binary_data}
        return None
    except Exception as e:
        print(f"Error getting image content: {e}")
        return None

async def get_all_image_metadata_supabase(skip: int = 0, limit: int = 50):
    """Get all image metadata from Supabase"""
    try:
        result = supabase.table("image_metadata").select("*").range(skip, skip + limit - 1).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting all image metadata: {e}")
        return []

async def delete_image_supabase(metadata_id: int):
    """Delete image and its metadata from Supabase"""
    try:
        # First get metadata to find content_id
        metadata_result = supabase.table("image_metadata").select("content_id").eq("id", metadata_id).execute()
        if not metadata_result.data:
            return False
            
        content_id = metadata_result.data[0]["content_id"]
        
        # Delete metadata (this will cascade delete content due to foreign key)
        delete_result = supabase.table("image_metadata").delete().eq("id", metadata_id).execute()
        
        return bool(delete_result.data)
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False

# Article update/revision operations
async def update_article_revision_supabase(article_id: int, content: str, comment: str, user_id: int) -> Optional[Article]:
    """Update article by creating a new revision"""
    try:
        # Create new revision
        revision_result = supabase.table("revision").insert({
            "content": content,
            "comment": comment,
            "article_id": article_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
        
        if not revision_result.data:
            return None
            
        revision = revision_result.data[0]
        revision_id = revision["id"]
        
        # Update article's current revision ID and updated_at
        article_update = supabase.table("article").update({
            "current_revision_id": revision_id,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", article_id).execute()
        
        if not article_update.data:
            return None
            
        # Get the updated article with new revision
        return await get_article_by_title_supabase_by_id(article_id)
        
    except Exception as e:
        print(f"Error updating article revision: {e}")
        return None

async def update_article_revision_supabase_with_revision_id(article_id: int, content: str, comment: str, user_id: int) -> tuple[Optional[Article], Optional[int]]:
    """Update article by creating a new revision and return both article and revision ID"""
    try:
        # Create new revision
        revision_result = supabase.table("revision").insert({
            "content": content,
            "comment": comment,
            "article_id": article_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
        
        if not revision_result.data:
            return None, None
            
        revision = revision_result.data[0]
        revision_id = revision["id"]
        
        # DON'T update article's current revision ID yet - wait for approval
        # Only update the article's updated_at timestamp to indicate activity
        article_update = supabase.table("article").update({
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", article_id).execute()
        
        if not article_update.data:
            return None, None
            
        # Get the updated article with new revision
        updated_article = await get_article_by_title_supabase_by_id(article_id)
        return updated_article, revision_id
        
    except Exception as e:
        print(f"Error updating article revision: {e}")
        return None, None

async def get_article_by_title_supabase_by_id(article_id: int) -> Optional[Article]:
    """Get article by ID from Supabase WITH revision data"""
    try:
        # Get article
        article_result = supabase.table("article").select("*").eq("id", article_id).execute()
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
        
        return Article(
            id=article_data["id"],
            title=article_data["title"],
            created_at=article_data["created_at"],
            updated_at=article_data["updated_at"],
            current_revision_id=article_data.get("current_revision_id"),
            currentRevision=current_revision
        )
    except Exception as e:
        print(f"Error getting article by ID: {e}")
        return None

async def get_article_revisions_supabase(article_id: int) -> List[dict]:
    """Get all revisions for an article by article ID - DIRECT FIX"""
    try:
        # Direct database query
        revisions_result = supabase.table("revision").select("""
            id, content, comment, timestamp, article_id, user_id, status, is_approved, needs_review
        """).eq("article_id", article_id).order("timestamp", desc=True).execute()

        if not revisions_result.data:
            return []

        revisions = []
        for rev_data in revisions_result.data:
            # Query each revision individually using the same approach as revision details
            individual_revision_result = supabase.table("revision").select("""
                id, content, comment, timestamp, article_id, user_id, status, is_approved, needs_review, tsvector_content
            """).eq("id", rev_data["id"]).execute()
            
            if individual_revision_result.data:
                actual_rev = individual_revision_result.data[0]
                # Use the individual query results (same as revision details endpoint)
                status = actual_rev.get("status") or "pending"
                is_approved = actual_rev.get("is_approved") or False
                needs_review = actual_rev.get("needs_review") if actual_rev.get("needs_review") is not None else True
            else:
                # Fallback to original data
                status = rev_data.get("status") or "pending"
                is_approved = rev_data.get("is_approved") or False
                needs_review = rev_data.get("needs_review") if rev_data.get("needs_review") is not None else True
            
            # Get user data
            user_data = None
            if rev_data.get("user_id"):
                user_result = supabase.table("user").select("*").eq("id", rev_data["user_id"]).execute()
                if user_result.data:
                    user_data = user_result.data[0]
            
            # Get comments for this revision
            comments_result = supabase.table("comment").select("""
                id, content, created_at, user_id,
                user:user_id(id, username)
            """).eq("revision_id", rev_data["id"]).order("created_at", desc=False).execute()
            
            comments_data = []
            if comments_result.data:
                for comment in comments_result.data:
                    comments_data.append({
                        "id": comment["id"],
                        "content": comment["content"],
                        "created_at": comment["created_at"],
                        "user_id": comment["user_id"],
                        "revision_id": rev_data["id"],
                        "user": comment.get("user")
                    })
            
            revision_data = {
                "id": rev_data["id"],
                "content": rev_data["content"],
                "comment": rev_data["comment"],
                "timestamp": rev_data["timestamp"],
                "article_id": rev_data["article_id"],
                "user_id": rev_data["user_id"],
                "tsvector_content": rev_data.get("tsvector_content"),
                "status": status,
                "is_approved": is_approved,
                "needs_review": needs_review,
                "user": user_data,
                "comments": comments_data
            }
            revisions.append(revision_data)

        return revisions
    except Exception as e:
        print(f"Error getting article revisions: {e}")
        return []

async def add_comment_to_revision_supabase(revision_id: int, content: str, user_id: Optional[int] = None) -> Optional[dict]:
    """Add a comment to a revision"""
    try:
        # Insert comment into database
        comment_result = supabase.table("comment").insert({
            "content": content,
            "revision_id": revision_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        if not comment_result.data:
            return None
            
        comment_data = comment_result.data[0]
        
        # Get user info if user_id is provided
        user_data = None
        if user_id:
            user_result = supabase.table("user").select("*").eq("id", user_id).execute()
            if user_result.data:
                user_data = user_result.data[0]
        
        # Format comment data
        comment = {
            "id": comment_data["id"],
            "content": comment_data["content"],
            "created_at": comment_data["created_at"],
            "revision_id": comment_data["revision_id"],
            "user_id": comment_data["user_id"],
            "user": {
                "id": user_data["id"],
                "username": user_data["username"],
                "email": user_data["email"],
                "role": user_data.get("role", "user"),
                "is_active": user_data.get("is_active", True),
                "reputation_score": user_data.get("reputation_score", 0),
                "created_at": user_data["created_at"],
                "updated_at": user_data["updated_at"]
            } if user_data else None
        }
        
        return comment
    except Exception as e:
        print(f"Error adding comment to revision: {e}")
        return None

def calculate_text_diff(old_content: str, new_content: str) -> dict:
    """Calculate the differences between two text contents"""
    import difflib
    
    # Split content into lines for better diff visualization
    old_lines = old_content.splitlines(keepends=True)
    new_lines = new_content.splitlines(keepends=True)
    
    # Calculate unified diff
    diff = list(difflib.unified_diff(
        old_lines, 
        new_lines, 
        fromfile='Previous Version',
        tofile='Current Version',
        lineterm=''
    ))
    
    # Calculate statistics
    added_lines = 0
    removed_lines = 0
    modified_lines = 0
    
    for line in diff:
        if line.startswith('+') and not line.startswith('+++'):
            added_lines += 1
        elif line.startswith('-') and not line.startswith('---'):
            removed_lines += 1
    
    # Calculate word-level changes for more granular diff
    old_words = old_content.split()
    new_words = new_content.split()
    
    word_diff = list(difflib.unified_diff(
        old_words,
        new_words,
        fromfile='Previous',
        tofile='Current',
        lineterm=''
    ))
    
    # Calculate character-level changes
    char_diff = list(difflib.unified_diff(
        list(old_content),
        list(new_content),
        fromfile='Previous',
        tofile='Current',
        lineterm=''
    ))
    
    return {
        "line_diff": diff,
        "word_diff": word_diff,
        "char_diff": char_diff,
        "statistics": {
            "added_lines": added_lines,
            "removed_lines": removed_lines,
            "total_lines_old": len(old_lines),
            "total_lines_new": len(new_lines),
            "added_words": len([w for w in word_diff if w.startswith('+') and not w.startswith('+++')]),
            "removed_words": len([w for w in word_diff if w.startswith('-') and not w.startswith('---')]),
            "total_words_old": len(old_words),
            "total_words_new": len(new_words),
            "added_chars": len([c for c in char_diff if c.startswith('+') and not c.startswith('+++')]),
            "removed_chars": len([c for c in char_diff if c.startswith('-') and not c.startswith('---')]),
            "total_chars_old": len(old_content),
            "total_chars_new": len(new_content)
        },
        "summary": {
            "has_changes": len(diff) > 2,  # More than just headers
            "change_type": "major" if added_lines + removed_lines > 10 else "minor" if added_lines + removed_lines > 0 else "none",
            "net_change": added_lines - removed_lines
        }
    }

async def get_revision_diff_supabase(revision_id: int) -> Optional[dict]:
    """Get the diff between a revision and its previous version"""
    try:
        # Get the current revision
        current_revision = supabase.table("revision").select("*").eq("id", revision_id).execute()
        if not current_revision.data:
            return None
            
        current = current_revision.data[0]
        
        # Get the previous revision (if any)
        previous_revisions = supabase.table("revision").select("*").eq("article_id", current["article_id"]).lt("timestamp", current["timestamp"]).order("timestamp", desc=True).limit(1).execute()
        
        if not previous_revisions.data:
            # This is the first revision
            return {
                "revision_id": revision_id,
                "is_first_revision": True,
                "current_content": current["content"],
                "previous_content": None,
                "diff": None,
                "message": "This is the first revision of the article"
            }
        
        previous = previous_revisions.data[0]
        
        # Calculate diff
        diff_result = calculate_text_diff(previous["content"], current["content"])
        
        return {
            "revision_id": revision_id,
            "is_first_revision": False,
            "current_content": current["content"],
            "previous_content": previous["content"],
            "current_revision": {
                "id": current["id"],
                "timestamp": current["timestamp"],
                "comment": current["comment"],
                "user_id": current["user_id"]
            },
            "previous_revision": {
                "id": previous["id"],
                "timestamp": previous["timestamp"],
                "comment": previous["comment"],
                "user_id": previous["user_id"]
            },
            "diff": diff_result
        }
        
    except Exception as e:
        print(f"Error getting revision diff: {e}")
        return None

# --- Source CRUD Functions ---
async def create_source_supabase(source_data: dict) -> Optional[dict]:
    """Create a new source"""
    try:
        result = supabase.table("source").insert(source_data).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating source: {e}")
        return None

async def get_source_by_id_supabase(source_id: int) -> Optional[dict]:
    """Get a source by ID"""
    try:
        result = supabase.table("source").select("*").eq("id", source_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error getting source: {e}")
        return None

async def get_sources_by_article_supabase(article_id: int) -> List[dict]:
    """Get all sources for an article through references"""
    try:
        # Get references for this article with source data
        result = supabase.table("reference").select("*, source(*)").eq("article_id", article_id).order("reference_number").execute()
        if result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error getting sources for article: {e}")
        return []

async def update_source_supabase(source_id: int, source_data: dict) -> Optional[dict]:
    """Update a source"""
    try:
        result = supabase.table("source").update(source_data).eq("id", source_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error updating source: {e}")
        return None

async def delete_source_supabase(source_id: int) -> bool:
    """Delete a source"""
    try:
        # First delete all references to this source
        supabase.table("reference").delete().eq("source_id", source_id).execute()
        
        # Then delete the source
        result = supabase.table("source").delete().eq("id", source_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting source: {e}")
        return False

# --- Reference CRUD Functions ---
async def create_reference_supabase(reference_data: dict) -> Optional[dict]:
    """Create a new reference"""
    try:
        result = supabase.table("reference").insert(reference_data).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating reference: {e}")
        return None

async def get_references_by_article_supabase(article_id: int) -> List[dict]:
    """Get all references for an article"""
    try:
        result = supabase.table("reference").select("*, source(*)").eq("article_id", article_id).order("reference_number").execute()
        if result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error getting references for article: {e}")
        return []

async def update_reference_supabase(reference_id: int, reference_data: dict) -> Optional[dict]:
    """Update a reference"""
    try:
        result = supabase.table("reference").update(reference_data).eq("id", reference_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error updating reference: {e}")
        return None

async def delete_reference_supabase(reference_id: int) -> bool:
    """Delete a reference"""
    try:
        result = supabase.table("reference").delete().eq("id", reference_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting reference: {e}")
        return False

async def renumber_references_supabase(article_id: int) -> bool:
    """Renumber references for an article after deletion"""
    try:
        # Get all references for the article ordered by creation time
        result = supabase.table("reference").select("*").eq("article_id", article_id).order("created_at").execute()
        if not result.data:
            return True
            
        # Renumber them sequentially
        for i, ref in enumerate(result.data, 1):
            supabase.table("reference").update({"reference_number": i}).eq("id", ref["id"]).execute()
        
        return True
    except Exception as e:
        print(f"Error renumbering references: {e}")
        return False
