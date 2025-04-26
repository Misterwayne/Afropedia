# crud/user_crud.py
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User, UserCreate
from auth.security import get_password_hash # Import hashing function (create this file)
from typing import Optional


async def get_user_by_username(session: AsyncSession, username: str) -> Optional[User]:
    statement = select(User).where(User.username == username)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_user(session: AsyncSession, user_id: int) -> Optional[User]:
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, *, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user