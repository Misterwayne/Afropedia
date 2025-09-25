# routers/advanced_search.py
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from search_service import search_service

router = APIRouter()

@router.get("/search", response_model=Dict[str, Any])
async def advanced_search(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results to return"),
    category: Optional[str] = Query(None, description="Filter by category (article, book)"),
    author: Optional[str] = Query(None, description="Filter by author"),
    sort_by: Optional[str] = Query("relevance", description="Sort by (relevance, date, title)")
):
    """Advanced search using MeiliSearch with typo tolerance and intelligent ranking"""
    
    try:
        # Search articles and books without filters for now
        # TODO: Add proper filtering once MeiliSearch indexes are configured correctly
        articles_result = await search_service.search_articles(q, limit, None)
        books_result = await search_service.search_books(q, limit, None)
        
        # Get suggestions
        suggestions = await search_service.get_suggestions(q, 10)
        
        # Combine results
        total_results = articles_result['totalHits'] + books_result['totalHits']
        
        return {
            'query': q,
            'articles': {
                'hits': articles_result['hits'],
                'totalHits': articles_result['totalHits'],
                'processingTimeMs': articles_result['processingTimeMs']
            },
            'books': {
                'hits': books_result['hits'],
                'totalHits': books_result['totalHits'],
                'processingTimeMs': books_result['processingTimeMs']
            },
            'suggestions': suggestions,
            'totalResults': total_results,
            'hasResults': total_results > 0,
            'filters': {
                'category': category,
                'author': author,
                'sortBy': sort_by
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/suggestions", response_model=List[str])
async def get_suggestions(
    q: str = Query(..., min_length=1, description="Query for suggestions")
):
    """Get search suggestions"""
    try:
        return await search_service.get_suggestions(q, 10)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestions error: {str(e)}")

@router.post("/reindex")
async def reindex_content():
    """Reindex all content (admin only)"""
    try:
        # Initialize indexes
        await search_service.initialize_indexes()
        
        # Index articles and books
        articles_success = await search_service.index_articles()
        books_success = await search_service.index_books()
        
        if articles_success and books_success:
            return {"message": "Content reindexed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to reindex content")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reindex error: {str(e)}")

@router.get("/stats")
async def get_search_stats():
    """Get search engine statistics"""
    try:
        articles_index = search_service.client.index(search_service.articles_index)
        books_index = search_service.client.index(search_service.books_index)
        
        articles_stats = articles_index.get_stats()
        books_stats = books_index.get_stats()
        
        return {
            'articles': {
                'totalDocuments': articles_stats.get('numberOfDocuments', 0),
                'isIndexing': articles_stats.get('isIndexing', False),
                'lastUpdate': articles_stats.get('lastUpdate', None)
            },
            'books': {
                'totalDocuments': books_stats.get('numberOfDocuments', 0),
                'isIndexing': books_stats.get('isIndexing', False),
                'lastUpdate': books_stats.get('lastUpdate', None)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")
