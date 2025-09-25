# routers/search.py
from fastapi import APIRouter, Depends, Query # Import Query for parameter validation
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Dict, Any # Import Dict, Any for search results

from crud import article_crud
from database import get_session
from supabase_crud import search_articles_fts_supabase, suggest_article_titles_supabase

router = APIRouter()

# Define a response model if needed, or use Dict[str, Any]
# class SearchResult(BaseModel): # Example using Pydantic directly
#     id: int
#     title: str
#     rank: float
#     snippet: Optional[str] = None

@router.get("/results", response_model=List[Dict[str, Any]]) # Using Dict for flexibility
async def search_content(
    *,
    q: str = Query(..., min_length=1, description="Search query for full-text search") # Add validation
):
    """Performs full-text search across article content."""
    results = await search_articles_fts_supabase(query=q)
    return results


@router.get("/suggest", response_model=List[str]) # Returns list of titles (strings)
async def suggest_titles(
    *,
    q: str = Query(..., min_length=2, description="Query prefix for title suggestion") # Add validation
):
    """Suggests article titles based on query prefix."""
    titles = await suggest_article_titles_supabase(query=q)
    return titles