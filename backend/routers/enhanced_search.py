# routers/enhanced_search.py
from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from supabase import Client
from supabase_client import supabase
import re
from difflib import SequenceMatcher

router = APIRouter()

def calculate_similarity(a: str, b: str) -> float:
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def extract_keywords(query: str) -> List[str]:
    """Extract meaningful keywords from search query"""
    # Remove common words and split
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    words = re.findall(r'\b\w+\b', query.lower())
    return [word for word in words if word not in stop_words and len(word) > 2]

async def fuzzy_search_articles(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Perform fuzzy search on articles with similarity scoring"""
    try:
        # Get all articles for fuzzy matching - simplified query first
        result = supabase.table("article").select("id, title, created_at, updated_at").execute()
        
        articles = result.data or []
        if not articles:
            return []
        
        query_keywords = extract_keywords(query)
        scored_articles = []
        
        for article in articles:
            title = article.get('title', '').replace('_', ' ')
            content = ''  # We'll get content separately if needed
            
            # For now, let's just use title matching to see if we get results
            # We can add content search later
            
            # Calculate various similarity scores
            title_similarity = calculate_similarity(query, title)
            
            # Keyword matching in title only for now
            title_lower = title.lower()
            
            keyword_score = 0
            matched_keywords = []
            
            for keyword in query_keywords:
                if keyword in title_lower:
                    keyword_score += 2  # Title matches are more important
                    matched_keywords.append(keyword)
            
            # Partial matching for individual words
            query_words = query.lower().split()
            for word in query_words:
                if word in title_lower:
                    keyword_score += 1.5
            
            # Combined score - lower threshold for testing
            total_score = (title_similarity * 3) + (keyword_score * 0.3)
            
            # Lower threshold to see more results
            if total_score > 0.05 or len(matched_keywords) > 0:
                scored_articles.append({
                    'id': article['id'],
                    'title': title,
                    'content_snippet': f"Article about {title}",
                    'created_at': article.get('created_at'),
                    'updated_at': article.get('updated_at'),
                    'score': total_score,
                    'matched_keywords': matched_keywords,
                    'author': 'Unknown'  # Simplified for now
                })
        
        # Sort by score and return top results
        scored_articles.sort(key=lambda x: x['score'], reverse=True)
        return scored_articles[:limit]
        
    except Exception as e:
        print(f"Error in fuzzy search: {e}")
        return []

async def get_search_suggestions(query: str) -> List[str]:
    """Get intelligent search suggestions based on existing content"""
    try:
        # Get article titles for suggestions
        result = supabase.table("article").select("title").execute()
        titles = [article['title'].replace('_', ' ') for article in result.data or []]
        
        # Get book titles too
        book_result = supabase.table("book").select("title").execute()
        book_titles = [book['title'] for book in book_result.data or []]
        
        all_titles = titles + book_titles
        query_lower = query.lower()
        
        suggestions = []
        
        # Exact prefix matches (highest priority)
        for title in all_titles:
            if title.lower().startswith(query_lower):
                suggestions.append(title)
        
        # Partial word matches
        if len(suggestions) < 5:
            for title in all_titles:
                if query_lower in title.lower() and title not in suggestions:
                    suggestions.append(title)
        
        # Fuzzy matches for individual words
        if len(suggestions) < 8:
            query_words = query_lower.split()
            for title in all_titles:
                title_lower = title.lower()
                if any(word in title_lower for word in query_words) and title not in suggestions:
                    suggestions.append(title)
        
        return suggestions[:8]
        
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        return []

@router.get("/enhanced", response_model=Dict[str, Any])
async def enhanced_search(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results to return")
):
    """Enhanced search with fuzzy matching and intelligent suggestions"""
    
    # Get fuzzy search results
    articles = await fuzzy_search_articles(q, limit)
    
    # Get search suggestions
    suggestions = await get_search_suggestions(q)
    
    # Search books as well
    books = []
    try:
        book_result = supabase.table("book").select("*").execute()
        all_books = book_result.data or []
        
        for book in all_books:
            title_similarity = calculate_similarity(q, book.get('title', ''))
            author_similarity = calculate_similarity(q, book.get('author', ''))
            desc_similarity = calculate_similarity(q, book.get('description', ''))
            
            max_similarity = max(title_similarity, author_similarity, desc_similarity * 0.5)
            
            if max_similarity > 0.2:  # Threshold for book inclusion
                books.append({
                    **book,
                    'similarity_score': max_similarity
                })
        
        books.sort(key=lambda x: x['similarity_score'], reverse=True)
        books = books[:10]  # Limit books
        
    except Exception as e:
        print(f"Error searching books: {e}")
    
    return {
        'query': q,
        'articles': articles,
        'books': books,
        'suggestions': suggestions,
        'total_results': len(articles) + len(books),
        'has_results': len(articles) > 0 or len(books) > 0
    }

@router.get("/suggestions", response_model=List[str])
async def get_suggestions_only(
    q: str = Query(..., min_length=1, description="Query for suggestions")
):
    """Get search suggestions only"""
    return await get_search_suggestions(q)

@router.get("/debug/articles")
async def debug_articles():
    """Debug endpoint to check articles in database"""
    try:
        result = supabase.table("article").select("id, title, created_at").execute()
        return {
            "count": len(result.data or []),
            "articles": result.data or []
        }
    except Exception as e:
        return {"error": str(e)}
