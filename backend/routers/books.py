from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional

from database import get_session
from crud import book_crud # Import book CRUD functions
from models import BookRead, BookCreate, BookUpdate, UserRead # Import book schemas
from supabase_crud import get_books_supabase, create_book_supabase, get_book_by_id_supabase, update_book_supabase, delete_book_supabase
from auth.dependencies import get_current_user # Import if protecting routes
from crud.moderation_crud import submit_for_moderation
from moderation_models import Priority

router = APIRouter()

@router.post("/", response_model=BookRead, status_code=status.HTTP_201_CREATED)
async def create_book(
    *,
    session: AsyncSession = Depends(get_session),
    book_in: BookCreate
):
    """Creates a new book."""
    existing_book = await book_crud.get_book_by_titlte_and_author(session, 
        title=book_in.title, 
        author=book_in.author
    )
    if existing_book:
        raise HTTPException(status_code=400, detail="Book with this title already exists.")
    
    book = await book_crud.create_book(session=session, book_in=book_in)
    return book

@router.get("/", response_model=List[BookRead])
async def read_books(
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = Query(None, description="Filter by book title")) -> List[BookRead]:
    """Retrieves a list of books with optional filtering by title."""
    books = await get_books_supabase(skip=skip, limit=limit)
    return books

@router.get("/{book_id}")
async def read_book_by_id(
    book_id: int
):
    """Retrieves a specific book by its ID."""
    book = await get_book_by_id_supabase(book_id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Convert to dict and map summary to description for frontend compatibility
    book_dict = book.model_dump()
    book_dict["description"] = book_dict.pop("summary", None)
    return book_dict

@router.patch("/{book_id}", response_model=BookRead)
async def update_book(
    *,
    book_id: int,
    book_in: BookUpdate,
    current_user: UserRead = Depends(get_current_user)
):
    """Updates an existing book."""
    # Check if book exists
    existing_book = await get_book_by_id_supabase(book_id=book_id)
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Update the book
    book_update_data = book_in.model_dump(exclude_unset=True)
    updated_book = await update_book_supabase(book_id=book_id, book_update=book_update_data)
    if not updated_book:
        raise HTTPException(status_code=500, detail="Failed to update book")
    
    # Submit updated book for moderation (unless user is admin/moderator)
    if current_user.role not in ["admin", "moderator"]:
        await submit_for_moderation(
            content_type="book",
            content_id=updated_book.id,
            submitted_by=current_user.id,
            priority=Priority.NORMAL
        )
    
    return BookRead.model_validate(updated_book)

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int
):
    """Deletes a book."""
    # Check if book exists
    existing_book = await get_book_by_id_supabase(book_id=book_id)
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    success = await delete_book_supabase(book_id=book_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete book")
    return None

@router.get("/search", response_model=List[BookRead])
async def search_books(
    *,
    session: AsyncSession = Depends(get_session),
    search_term: str
):
    """Searches for books by title or author."""
    books = await book_crud.search_books(session, search_term=search_term)
    if not books:
        raise HTTPException(status_code=404, detail="No books found matching the search term.")
    return books

@router.get("/author/{author}", response_model=List[BookRead])
async def read_books_by_author(
    *,
    session: AsyncSession = Depends(get_session),
    author: str
):
    """Retrieves books by a specific author."""
    books = await book_crud.get_book_by_author(session, author=author)
    if not books:
        raise HTTPException(status_code=404, detail="No books found for this author.")
    return books

@router.get("/title/{title}", response_model=List[BookRead])
async def read_books_by_title(
    *,
    session: AsyncSession = Depends(get_session),
    title: str
):
    """Retrieves books by a specific title."""
    books = await book_crud.get_book_by_title(session, title=title)
    if not books:
        raise HTTPException(status_code=404, detail="No books found with this title.")
    return books

@router.get("/title/{title}/author/{author}", response_model=List[BookRead])
async def read_books_by_title_and_author(
    *,
    session: AsyncSession = Depends(get_session),
    title: str,
    author: str
):
    """Retrieves books by a specific title and author."""
    books = await book_crud.get_book_by_titlte_and_author(session, title=title, author=author)
    if not books:
        raise HTTPException(status_code=404, detail="No books found with this title and author.")
    return books


    