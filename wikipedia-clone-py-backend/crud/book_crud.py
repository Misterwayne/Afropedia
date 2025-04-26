from sqlmodel import Session, select
from sqlalchemy import or_ # Import 'or_' for combining search conditions
from sqlalchemy.ext.asyncio import AsyncSession
from models import Book, BookCreate, BookUpdate # Import book models/schemas
from typing import List, Optional


async def create_book(session: AsyncSession, *, book_in: BookCreate) -> Book:
    """Creates a new book in the database."""
    print(f"[CRUD Book] Creating Book: {book_in.title}")
    db_book = Book.model_validate(book_in)
    session.add(db_book)
    try:
        await session.commit()
        await session.refresh(db_book)
        print(f"[CRUD Book] Successfully created Book ID: {db_book.id}")
        return db_book
    except Exception as e:
        print(f"!!! Error committing Book: {e}")
        await session.rollback()
        raise

async def get_book_by_id(session: AsyncSession, book_id: int) -> Optional[Book]:
    """Retrieves a book by its ID."""
    print(f"[CRUD Book] Getting Book by ID: {book_id}")
    statement = select(Book).where(Book.id == book_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_book_by_title(session: AsyncSession, title: str) -> Optional[Book]:
    """Retrieves a book by its title."""
    print(f"[CRUD Book] Getting Book by Title: {title}")
    statement = select(Book).where(Book.title == title)
    result = await session.execute(statement)
    return result.scalar().all()

async def get_book_by_titlte_and_author(session: AsyncSession, title: str, author: str) -> Optional[Book]:
    """Retrieves a book by its title and author."""
    print(f"[CRUD Book] Getting Book by Title: {title} and Author: {author}")
    statement = select(Book).where(
        or_(
            Book.title == title,
            Book.author == author
        )
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_book_by_isbn(session: AsyncSession, isbn: str) -> Optional[Book]:
    """Retrieves a book by its ISBN."""
    print(f"[CRUD Book] Getting Book by ISBN: {isbn}")
    statement = select(Book).where(Book.isbn == isbn)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_book_by_author(session: AsyncSession, author: str) -> Optional[Book]:
    """Retrieves a book by its author."""
    print(f"[CRUD Book] Getting Book by Author: {author}")
    statement = select(Book).where(Book.author == author)
    result = await session.execute(statement)
    return result.scalar().all()

async def search_books(session: AsyncSession, search_term: str) -> List[Book]:
    """Searches for books by title or author."""
    print(f"[CRUD Book] Searching Books with term: {search_term}")
    statement = select(Book).where(
        or_(
            Book.title.ilike(f"%{search_term}%"),
            Book.author.ilike(f"%{search_term}%")
        )
    )
    result = await session.execute(statement)
    return result.scalars().all()

async def get_books(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Book]:
    """Retrieves a list of books"""
    print(f"[CRUD Book] Getting Books with skip={skip} and limit={limit}")
    statement = select(Book).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()

async def update_book(session: AsyncSession, *, db_book: Book, book_update: BookUpdate) -> Optional[Book]:
    """Updates an existing book."""
    print(f"[CRUD Book] Updating Book ID: {db_book.id}")
    for field, value in book_update.model_dump(exclude_unset=True).items():
        setattr(db_book, field, value)
    session.add(db_book)
    try:
        await session.commit()
        await session.refresh(db_book)
        print(f"[CRUD Book] Successfully updated Book ID: {db_book.id}")
        return db_book
    except Exception as e:
        print(f"!!! Error updating Book: {e}")
        await session.rollback()
        raise

async def delete_book(session: AsyncSession, *, db_book: Book) -> None:
    """Deletes a book from the database."""
    print(f"[CRUD Book] Deleting Book ID: {db_book.id}")
    await session.delete(db_book)
    try:
        await session.commit()
        print(f"[CRUD Book] Successfully deleted Book ID: {db_book.id}")
    except Exception as e:
        print(f"!!! Error deleting Book: {e}")
        await session.rollback()
        raise