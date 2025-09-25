# crud/article_crud.py
from sqlmodel import Session, select, func, text
from sqlalchemy.ext.asyncio import AsyncSession # Use AsyncSession
from models import Article, Comment, Revision, ArticleCreate, ArticleUpdate, User
from typing import List, Optional

# --- Helper for tsvector generation ---
async def generate_and_set_tsvector(session: AsyncSession, revision: Revision):
    """Generates tsvector for revision content and updates the object."""
    # Use SQLAlchemy core functions for platform-agnostic TSVector generation
    # Note: direct execution of SQL might be needed if func.to_tsvector isn't recognized correctly by driver/dialect
    stmt = select(func.to_tsvector('english', revision.content)).scalar_subquery()
    result = await session.execute(select(stmt))
    tsvector_value = result.scalar_one_or_none()
    revision.tsvector_content = tsvector_value
    # print(f"Generated tsvector: {tsvector_value}") # Debugging

# --- Article/Revision Creation (Transaction Handling) ---
async def create_article_with_revision(
    session: AsyncSession, *, article_in: ArticleCreate, user_id: int
) -> Optional[Article]:
    """Creates an Article and its first Revision within a transaction."""
    try:
        # Create Article (without current revision link first)
        db_article = Article(title=article_in.title) # Assume title is normalized beforehand
        session.add(db_article)
        await session.flush() # Flush to get the article ID

        # Create Revision
        db_revision = Revision(
            content=article_in.content,
            comment=article_in.comment,
            article_id=db_article.id,
            user_id=user_id,
        )
        # Generate and set tsvector
        await generate_and_set_tsvector(session, db_revision)

        session.add(db_revision)
        await session.flush() # Flush to get the revision ID

        # Link revision to article
        db_article.current_revision_id = db_revision.id
        session.add(db_article)

        await session.commit() # Commit the transaction
        # Refresh to load relationships correctly, especially currentRevision
        await session.refresh(db_article, attribute_names=["currentRevision"])
        if db_article.currentRevision: # Eager load user if possible
             await session.refresh(db_article.currentRevision, attribute_names=["user"])

        return db_article
    except Exception as e:
        await session.rollback() # Rollback on error
        print(f"Error creating article: {e}") # Log error
        return None

# --- Get Article By Title ---
async def get_article_by_title(session: AsyncSession, title: str) -> Optional[Article]:
    statement = select(Article).where(Article.title == title)
    result = await session.execute(statement)
    article = result.scalar_one_or_none()
    if article: # Eager load the current revision and its user if found
        await session.refresh(article, attribute_names=["currentRevision"])
        if article.currentRevision:
             await session.refresh(article.currentRevision, attribute_names=["user"])
    return article

# --- Get All Articles (Summary) ---
async def get_articles(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Article]:
    statement = select(Article).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()

# --- Update Article (Create New Revision) ---
async def update_article_revision(
    session: AsyncSession, *, db_article: Article, update_data: ArticleUpdate, user_id: int
) -> Optional[Article]:
    """Creates a new revision for an existing article."""
    try:
        # Create New Revision
        new_revision = Revision(
            content=update_data.content,
            comment=update_data.comment,
            article_id=db_article.id,
            user_id=user_id,
        )
        await generate_and_set_tsvector(session, new_revision)
        session.add(new_revision)
        await session.flush() # Get new revision ID

        # Update Article's current revision link
        db_article.current_revision_id = new_revision.id
        session.add(db_article)
        await session.commit() # Commit transaction

        # Refresh to load relationships
        await session.refresh(db_article, attribute_names=["currentRevision"])
        if db_article.currentRevision:
             await session.refresh(db_article.currentRevision, attribute_names=["user"])

        return db_article
    except Exception as e:
        await session.rollback()
        print(f"Error updating article: {e}")
        return None

# --- Delete Article ---
async def delete_article(session: AsyncSession, db_article: Article) -> bool:
    try:
        # Deleting the article might require handling FK constraints carefully.
        # If revisions have article_id FK with CASCADE, they might be deleted automatically.
        # If current_revision_id has ON DELETE SET NULL/RESTRICT, handle accordingly.
        # Let's assume simple delete for now.
        await session.delete(db_article)
        await session.commit()
        return True
    except Exception as e:
        await session.rollback()
        print(f"Error deleting article: {e}")
        return False

# --- Get Revisions for Article ---
async def get_article_revisions(session: AsyncSession, article_id: int) -> List[Revision]:
    statement = select(Revision).where(Revision.article_id == article_id).order_by(Revision.timestamp.desc())
    result = await session.execute(statement)
    revisions = result.scalars().all()
     # Eager load users for revisions (can be inefficient for many revisions - consider separate query if needed)
    # for rev in revisions:
    #     if rev.user_id: await session.refresh(rev, attribute_names=["user"])
    return revisions

async def get_article_revisions_by_id(session: AsyncSession, id: int) -> List[Revision]:
    statement = select(Revision).where(Revision.id == id).order_by(Revision.timestamp.desc())
    result = await session.execute(statement)
    revisions = result.scalars().one()
     # Eager load users for revisions (can be inefficient for many revisions - consider separate query if needed)
    # for rev in revisions:
    #     if rev.user_id: await session.refresh(rev, attribute_names=["user"])
    return revisions

# --- Search ---
async def search_articles_fts(session: AsyncSession, query: str) -> List[dict]:
    """Performs full-text search on current revisions."""
    if not query.strip(): return []
    # Using text for complex FTS query - ensure parameters are bound correctly
    search_stmt = text("""
        SELECT
            a.id,
            a.title,
            ts_rank_cd(r.tsvector_content, websearch_to_tsquery('english', :query)) AS rank,
            ts_headline('english', r.content, websearch_to_tsquery('english', :query),
                'StartSel=**,StopSel=**,MaxWords=35,MinWords=15,HighlightAll=FALSE,MaxFragments=3') AS snippet
        FROM article AS a
        INNER JOIN revision AS r ON a.current_revision_id = r.id
        WHERE r.tsvector_content @@ websearch_to_tsquery('english', :query)
          AND r.tsvector_content IS NOT NULL
        ORDER BY rank DESC
        LIMIT 20;
    """)
    result = await session.execute(search_stmt, {"query": query.strip()})
    # Convert rows to dictionaries
    return [dict(row._mapping) for row in result]

async def suggest_article_titles(session: AsyncSession, query: str) -> List[str]:
    """Suggests article titles starting with the query."""
    if not query.strip() or len(query) < 2: return []
    normalized_query = query.strip().replace(" ", "_") # Basic normalization
    statement = select(Article.title).where(
        Article.title.ilike(f"{normalized_query}%") # Case-insensitive starts_with
    ).order_by(Article.title).limit(10)
    result = await session.execute(statement)
    return result.scalars().all()

async def update_revision_comment(
    session: AsyncSession, 
    revision: Revision, 
    comment: str
) -> Optional[Revision]:
    try:
        new_comment = Comment(
            content=comment,
            revision_id=revision.id,
            user_id=revision.user_id
        )
        
        session.add(new_comment)
        await session.flush() 
        

        await session.refresh(revision)
        await session.commit()
        
        await session.refresh(revision, ["comments", "user"])
        
        return revision
    except Exception as e:
        await session.rollback()
        print(f"Error updating revision comment: {e}")
        return None

# Add user CRUD functions (get_user, create_user, etc.) in crud/user_crud.py