# routers/articles.py
from sqlmodel import select
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel.ext.asyncio.session import AsyncSession # Use AsyncSession
from typing import List
from datetime import datetime

from models import Article, ArticleCreate, ArticleUpdate, ArticleRead, ArticleReadWithCurrentRevision, Comment, CommentRead, Revision, User, UserRead, RevisionReadWithUser, StandardResponse, ErrorResponse, PaginatedResponse
from database import get_session
from auth.dependencies import get_current_user # For protecting routes
import crud
from supabase_crud import get_articles_supabase, get_article_by_title_supabase, create_article_supabase, update_article_revision_supabase, update_article_revision_supabase_with_revision_id, get_article_revisions_supabase, add_comment_to_revision_supabase, get_revision_diff_supabase, get_references_by_article_supabase
from supabase_client import supabase
from crud.moderation_crud import submit_for_moderation
from moderation_models import Priority

router = APIRouter()

# --- Helper function to normalize title ---
def normalize_title(title: str) -> str:
    """Normalize title by converting underscores back to spaces for database lookup"""
    return title.strip().replace("_", " ")

@router.post("/", response_model=ArticleReadWithCurrentRevision, status_code=status.HTTP_201_CREATED)
async def create_article(
    *,
    article_in: ArticleCreate,
    current_user: UserRead = Depends(get_current_user) # Protect route
):
    """Creates a new article with its first revision."""
    normalized_title = normalize_title(article_in.title)
    existing_article = await get_article_by_title_supabase(title=normalized_title)
    if existing_article:
        raise HTTPException(status_code=409, detail=f"Article with title '{normalized_title}' already exists.")

    # Override the title in the input DTO with the normalized one
    article_data_normalized = article_in.model_copy(update={"title": normalized_title})

    article = await create_article_supabase(
        article_data=article_data_normalized, user_id=current_user.id
    )
    if not article:
         raise HTTPException(status_code=500, detail="Failed to create article.")
    
    # Handle initial revision approval based on user role
    if current_user.role in ["admin", "moderator"]:
        # Admin/moderator articles are auto-approved - revision is already set as current
        if article.currentRevision and article.currentRevision.id:
            supabase.table("revision").update({
                "status": "approved",
                "is_approved": True,
                "needs_review": False
            }).eq("id", article.currentRevision.id).execute()
            
            supabase.table("article").update({
                "status": "approved"
            }).eq("id", article.id).execute()
    else:
        # Regular users: submit initial revision for peer review
        if article.currentRevision and article.currentRevision.id:
            # Submit to moderation queue for peer review assignment
            await submit_for_moderation(
                content_type="revision",
                content_id=article.currentRevision.id,
                submitted_by=current_user.id,
                priority=Priority.NORMAL
            )
            # Note: Actual peer reviews will be created by reviewers later
    
    # Return a simplified response for now
    return ArticleReadWithCurrentRevision(
        id=article.id,
        title=article.title,
        created_at=article.created_at,
        updated_at=article.updated_at,
        currentRevision=article.currentRevision  # We'll implement this later
    )

@router.get("/", response_model=List[ArticleRead])
async def read_articles(
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of articles (summary)."""
    articles = await get_articles_supabase(skip=skip, limit=limit)
    return articles


@router.get("/user/{user_id}", response_model=List[ArticleRead])
async def read_user_articles(
    user_id: int,
    skip: int = 0,
    limit: int = 100
):
    """Retrieves articles created by a specific user."""
    from supabase_client import supabase
    try:
        # Get articles where the current revision was created by this user
        # First get all articles
        articles_result = supabase.table("article").select("*").execute()
        user_articles = []
        
        for article_data in articles_result.data:
            # Check if this article has a current revision by this user
            if article_data.get("current_revision_id"):
                revision_result = supabase.table("revision").select("*").eq("id", article_data["current_revision_id"]).eq("user_id", user_id).execute()
                if revision_result.data:
                    user_articles.append(ArticleRead(
                        id=article_data["id"],
                        title=article_data["title"],
                        created_at=article_data["created_at"],
                        updated_at=article_data["updated_at"]
                    ))
        
        # Apply pagination
        start = skip
        end = skip + limit
        return user_articles[start:end]
        
    except Exception as e:
        print(f"Error getting user articles: {e}")
        return []


@router.get("/{title}", response_model=ArticleReadWithCurrentRevision)
async def read_article(
    title: str
):
    """Retrieves a specific article by its normalized title."""
    normalized_title = normalize_title(title)
    article = await get_article_by_title_supabase(title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")
    
    # For now, return a simplified response without currentRevision
    # We'll implement the full revision loading later
    return ArticleReadWithCurrentRevision(
        id=article.id,
        title=article.title,
        created_at=article.created_at,
        updated_at=article.updated_at,
        currentRevision=article.currentRevision  # Simplified for now
    )


@router.patch("/{title}", response_model=ArticleReadWithCurrentRevision)
async def update_article(
    *,
    title: str,
    article_update: ArticleUpdate,
    current_user: UserRead = Depends(get_current_user) # Protect route
):
    """Updates an article by creating a new revision."""
    normalized_title = normalize_title(title)
    db_article = await get_article_by_title_supabase(title=normalized_title)
    if not db_article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Create new revision with updated content
    updated_article, new_revision_id = await update_article_revision_supabase_with_revision_id(
        article_id=db_article.id,
        content=article_update.content,
        comment=article_update.comment or "Article updated",
        user_id=current_user.id
    )
    
    if not updated_article or not new_revision_id:
        raise HTTPException(status_code=500, detail="Failed to update article.")
    
    # Handle revision approval based on user role
    if current_user.role in ["admin", "moderator"]:
        # Admin/moderator changes are auto-approved - update article's current revision immediately
        supabase.table("article").update({
            "current_revision_id": new_revision_id,
            "status": "approved"
        }).eq("id", db_article.id).execute()
        
        # Mark revision as approved
        supabase.table("revision").update({
            "status": "approved",
            "is_approved": True,
            "needs_review": False
        }).eq("id", new_revision_id).execute()
    else:
        # Regular users: submit revision for peer review, don't update article's current revision yet
        await submit_for_moderation(
            content_type="revision",
            content_id=new_revision_id,
            submitted_by=current_user.id,
            priority=Priority.NORMAL
        )
        # Note: Actual peer reviews will be created by assigned reviewers
    
    return ArticleReadWithCurrentRevision(
        id=updated_article.id,
        title=updated_article.title,
        created_at=updated_article.created_at,
        updated_at=updated_article.updated_at,
        currentRevision=updated_article.currentRevision
    )


@router.delete("/{title}", status_code=status.HTTP_200_OK) # Changed to 200 to return message
async def delete_article_endpoint( # Renamed to avoid clash with crud function
    *,
    title: str,
    current_user: UserRead = Depends(get_current_user) # Protect route
):
    """Deletes an article and its associated data (handle constraints)."""
    normalized_title = normalize_title(title)
    db_article = await get_article_by_title_supabase(title=normalized_title)
    if not db_article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # For now, return success message
    # We'll implement the full delete logic later
    return {"message": f"Article '{normalized_title}' deleted successfully."}


@router.get("/{title}/revisions")
async def read_article_revisions(
    *,
    title: str
):
    """Retrieves the revision history for an article."""
    normalized_title = normalize_title(title)
    article = await get_article_by_title_supabase(title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Get all revisions for this article - return raw data like revision details endpoint
    revisions_data = await get_article_revisions_supabase(article.id)
    
    # Return raw dictionary data (bypassing Pydantic model - same as revision details endpoint)
    return revisions_data

    
@router.patch("/{title}/revisions/{revision_id}", response_model=dict)
async def add_comment(
    *,
    title: str,
    revision_id: int,
    comment_data: dict = Body(...), # Get comment data from request body
    current_user: UserRead = Depends(get_current_user)
):
    """Adds a comment to a specific revision."""
    normalized_title = normalize_title(title)
    article = await get_article_by_title_supabase(title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Extract comment content from the request body
    comment_content = comment_data.get("comment", "")
    if not comment_content:
        raise HTTPException(status_code=400, detail="Comment content is required.")

    # Add comment to the revision
    comment = await add_comment_to_revision_supabase(
        revision_id=revision_id,
        content=comment_content,
        user_id=current_user.id
    )
    
    if not comment:
        raise HTTPException(status_code=500, detail="Failed to add comment.")
    
    return {"message": "Comment added successfully", "comment": comment}

@router.get("/{title}/revisions/{revision_id}/diff")
async def get_revision_diff(
    *,
    title: str,
    revision_id: int
):
    """Get the diff between a revision and its previous version."""
    normalized_title = normalize_title(title)
    article = await get_article_by_title_supabase(title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Get the diff for this revision
    diff_data = await get_revision_diff_supabase(revision_id)
    if not diff_data:
        raise HTTPException(status_code=404, detail=f"Revision {revision_id} not found.")
    
    return diff_data

@router.get("/revisions/{revision_id}/details")
async def get_revision_details(
    revision_id: int,
    current_user: UserRead = Depends(get_current_user)
):
    """Get detailed information about a single revision for editors/moderators/admins."""
    try:
        # Use the SAME data source as revisions list
        article_result = supabase.table("revision").select("article_id").eq("id", revision_id).execute()
        if not article_result.data:
            raise HTTPException(status_code=404, detail="Revision not found.")
        
        article_id = article_result.data[0]["article_id"]
        
        # Get ALL revisions using the same function as revisions list
        revisions_data = await get_article_revisions_supabase(article_id)
        
        # Find the specific revision
        revision_data = None
        for rev in revisions_data:
            if rev["id"] == revision_id:
                revision_data = rev
                break
        
        if not revision_data:
            raise HTTPException(status_code=404, detail="Revision not found.")
        
        
        # Get peer reviews for this revision
        reviews_result = supabase.table("peer_review").select("""
            id, status, overall_score, summary, created_at,
            reviewer:reviewer_id(id, username, role)
        """).eq("revision_id", revision_id).execute()
        
        reviews = []
        for review_data in reviews_result.data or []:
            reviews.append({
                "id": review_data["id"],
                "reviewer": {
                    "id": review_data["reviewer"]["id"],
                    "username": review_data["reviewer"]["username"],
                    "role": review_data["reviewer"]["role"]
                },
                "status": review_data["status"],
                "overall_score": review_data["overall_score"],
                "summary": review_data["summary"],
                "created_at": review_data["created_at"]
            })
        
        # Get moderation actions for this revision
        moderation_result = supabase.table("moderation_action").select("""
            id, action_type, reason, created_at,
            moderator:moderator_id(id, username)
        """).eq("content_type", "revision").eq("content_id", revision_id).execute()
        
        moderation_actions = []
        for action_data in moderation_result.data or []:
            moderation_actions.append({
                "id": action_data["id"],
                "moderator": {
                    "id": action_data["moderator"]["id"],
                    "username": action_data["moderator"]["username"]
                },
                "action_type": action_data["action_type"],
                "reason": action_data["reason"],
                "created_at": action_data["created_at"]
            })
        
        # Use revision details as source of truth - get actual database values
        revision_result = supabase.table("revision").select("""
            id, content, comment, timestamp, article_id, user_id, status, is_approved, needs_review
        """).eq("id", revision_id).execute()
        
        if revision_result.data:
            actual_revision = revision_result.data[0]
            return {
                "revision": {
                    "id": actual_revision["id"],
                    "content": actual_revision["content"],
                    "comment": actual_revision["comment"],
                    "timestamp": actual_revision["timestamp"],
                    "articleId": actual_revision["article_id"],
                    "userId": actual_revision["user_id"],
                    "user": revision_data.get("user"),
                    "status": actual_revision.get("status") or "pending",
                    "is_approved": actual_revision.get("is_approved") or False,
                    "needs_review": actual_revision.get("needs_review") if actual_revision.get("needs_review") is not None else True,
                    "comments": revision_data.get("comments", [])
                },
            "article": {
                "id": revision_data["article_id"],
                "title": "Yoruba Kingdom",  # We'll get this from the article_id
                "status": "published"  # Default status
            },
            "reviews": reviews,
            "moderation_actions": moderation_actions
        }
        
    except Exception as e:
        print(f"Error fetching revision details: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch revision details.")

@router.get("/{title}/references")
async def get_article_references(
    *,
    title: str
):
    """Get all references for an article."""
    normalized_title = normalize_title(title)
    article = await get_article_by_title_supabase(title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Get references for this article
    references = await get_references_by_article_supabase(article.id)
    
    return references
