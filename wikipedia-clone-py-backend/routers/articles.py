# routers/articles.py
from sqlmodel import select
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel.ext.asyncio.session import AsyncSession # Use AsyncSession
from typing import List

from models import Article, ArticleCreate, ArticleUpdate, ArticleRead, ArticleReadWithCurrentRevision, Comment, CommentRead, Revision, User, UserRead, RevisionReadWithUser
from database import get_session
from auth.dependencies import get_current_user # For protecting routes
import crud

router = APIRouter()

# --- Helper function to normalize title ---
def normalize_title(title: str) -> str:
    return title.strip().replace(" ", "_")

@router.post("/", response_model=ArticleReadWithCurrentRevision, status_code=status.HTTP_201_CREATED)
async def create_article(
    *,
    session: AsyncSession = Depends(get_session),
    article_in: ArticleCreate,
    current_user: UserRead = Depends(get_current_user) # Protect route
):
    """Creates a new article with its first revision."""
    normalized_title = normalize_title(article_in.title)
    existing_article = await crud.article_crud.get_article_by_title(session, title=normalized_title)
    if existing_article:
        raise HTTPException(status_code=409, detail=f"Article with title '{normalized_title}' already exists.")

    # Override the title in the input DTO with the normalized one
    article_data_normalized = article_in.model_copy(update={"title": normalized_title})

    article = await crud.article_crud.create_article_with_revision(
        session=session, article_in=article_data_normalized, user_id=current_user.id
    )
    if not article:
         raise HTTPException(status_code=500, detail="Failed to create article.")
    return article

@router.get("/", response_model=List[ArticleRead])
async def read_articles(
    session: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of articles (summary)."""
    articles = await crud.article_crud.get_articles(session, skip=skip, limit=limit)
    return articles


@router.get("/{title}", response_model=ArticleReadWithCurrentRevision)
async def read_article(
    *,
    session: AsyncSession = Depends(get_session),
    title: str
):
    """Retrieves a specific article by its normalized title."""
    normalized_title = normalize_title(title)
    article = await crud.article_crud.get_article_by_title(session, title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")
    
    if not article.currentRevision:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' found but has no current revision data.")
    
    # Load relationships explicitly
    await session.refresh(article.currentRevision, ['user'])
    
    # Get comments for current revision
    comment_stmt = select(Comment).where(Comment.revision_id == article.currentRevision.id)
    result = await session.execute(comment_stmt)
    comments = result.scalars().all()
    
    # Create response data manually
    response_data = {
        'id': article.id,
        'title': article.title,
        'created_at': article.created_at,
        'updated_at': article.updated_at,
        'currentRevision': {
            'id': article.currentRevision.id,
            'content': article.currentRevision.content,
            'comment': article.currentRevision.comment,
            'timestamp': article.currentRevision.timestamp,
            'user': article.currentRevision.user,
            'comments': [CommentRead.model_validate(c) for c in comments]
        }
    }
    
    return ArticleReadWithCurrentRevision.model_validate(response_data)


@router.patch("/{title}", response_model=ArticleReadWithCurrentRevision)
async def update_article(
    *,
    session: AsyncSession = Depends(get_session),
    title: str,
    article_update: ArticleUpdate,
    current_user: UserRead = Depends(get_current_user) # Protect route
):
    """Updates an article by creating a new revision."""
    normalized_title = normalize_title(title)
    db_article = await crud.article_crud.get_article_by_title(session, title=normalized_title)
    if not db_article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    updated_article = await crud.article_crud.update_article_revision(
        session=session, db_article=db_article, update_data=article_update, user_id=current_user.id
    )
    if not updated_article:
         raise HTTPException(status_code=500, detail="Failed to update article.")
    return updated_article


@router.delete("/{title}", status_code=status.HTTP_200_OK) # Changed to 200 to return message
async def delete_article_endpoint( # Renamed to avoid clash with crud function
    *,
    session: AsyncSession = Depends(get_session),
    title: str,
    current_user: UserRead = Depends(get_current_user) # Protect route
):
    """Deletes an article and its associated data (handle constraints)."""
    normalized_title = normalize_title(title)
    db_article = await crud.article_crud.get_article_by_title(session, title=normalized_title)
    if not db_article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Optional: Add permission checks here (is user admin? owner?)

    success = await crud.article_crud.delete_article(session=session, db_article=db_article)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to delete article.")
    return {"message": f"Article '{normalized_title}' deleted successfully."}


@router.get("/{title}/revisions", response_model=List[RevisionReadWithUser])
async def read_article_revisions(
    *,
    session: AsyncSession = Depends(get_session),
    title: str
):
    """Retrieves the revision history for an article."""
    normalized_title = normalize_title(title)
    article = await crud.article_crud.get_article_by_title(session, title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    # Get revisions with their relationships
    revisions = await crud.article_crud.get_article_revisions(session, article_id=article.id)
    
    populated_revisions = []
    for rev in revisions:
        # Refresh relationships
        await session.refresh(rev, ['user', 'comments'])
        
        # Get comments for this revision
        comments = await session.execute(
            select(Comment).where(Comment.revision_id == rev.id)
        )
        
        comment_list = comments.scalars().all()
        
        # Create the response model
        revision_data = {
            'id': rev.id,
            'content': rev.content,
            'comment': rev.comment,
            'timestamp': rev.timestamp,
            'user': rev.user,
            'comments': [CommentRead.model_validate(c) for c in comment_list]
        }
        
        populated_revisions.append(RevisionReadWithUser.model_validate(revision_data))

    return populated_revisions
    
@router.patch("/{title}/revisions/{revision_id}", response_model=RevisionReadWithUser)
async def add_comment(
    *,
    session: AsyncSession = Depends(get_session),
    title: str,
    revision_id: int,
    comment: str = Body(...), # Use Body to get comment from request body
):
    """Adds a comment to a specific revision."""
    normalized_title = normalize_title(title)
    article = await crud.article_crud.get_article_by_title(session, title=normalized_title)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{normalized_title}' not found.")

    revision = await crud.article_crud.get_article_revisions_by_id(session, id=revision_id)
    if not revision or revision.article_id != article.id:
        raise HTTPException(status_code=404, detail=f"Revision ID {revision_id} not found for article '{normalized_title}'.")

    # Update the comment
    newRevision = await crud.article_crud.update_revision_comment(
        session=session, revision=revision, comment=comment
    )
    if not newRevision:
        raise HTTPException(status_code=500, detail="Failed to update revision comment")
    
    # Ensure user data is loaded
    if newRevision.user_id and not newRevision.user:
        await session.refresh(newRevision, attribute_names=["user"])
    
    return RevisionReadWithUser.model_validate(newRevision)