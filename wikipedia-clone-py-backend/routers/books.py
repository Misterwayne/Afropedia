from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional

from database import get_session
from crud import book_crud # Import book CRUD functions
from models import BookRead, BookCreate, BookUpdate # Import book schemas
# from auth.dependencies import get_current_user # Import if protecting routes

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
    session: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = Query(None, description="Filter by book title")) -> List[BookRead]:
    """Retrieves a list of books with optional filtering by title."""
    if title:
        books = await book_crud.get_book_by_title(session, title=title)
    else:
        books = await book_crud.get_books(session, skip=skip, limit=limit)
    return books

@router.get("/{book_id}", response_model=BookRead)
async def read_book_by_id(
    *,
    session: AsyncSession = Depends(get_session),
    book_id: int
):
    """Retrieves a specific book by its ID."""
    book = await book_crud.get_book_by_id(session, book_id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.patch("/{book_id}", response_model=BookRead)
async def update_book(
    *,
    session: AsyncSession = Depends(get_session),
    book_id: int,
    book_in: BookUpdate
):
    """Updates an existing book."""
    db_book = await book_crud.get_book_by_id(session, book_id=book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    updated_book = await book_crud.update_book(session=session, db_book=db_book, book_in=book_in)
    return updated_book

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    *,
    session: AsyncSession = Depends(get_session),
    book_id: int
):
    """Deletes a book."""
    db_book = await book_crud.get_book_by_id(session, book_id=book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    await book_crud.delete_book(session=session, db_book=db_book)
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


    