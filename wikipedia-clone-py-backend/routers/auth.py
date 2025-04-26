# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # For standard login form
from sqlmodel.ext.asyncio.session import AsyncSession # Use AsyncSession
from datetime import timedelta
import crud
from config import settings
from crud import user_crud
from models import UserRead, UserCreate, UserLogin
from database import get_session
from auth import security
from auth.dependencies import get_current_user # Import the dependency

router = APIRouter()

@router.post("/register", response_model=UserRead)
async def register_user(
    *,
    session: AsyncSession = Depends(get_session),
    user_in: UserCreate
):
    """Registers a new user."""
    existing_user = await crud.user_crud.get_user_by_username(session, username=user_in.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    existing_email = await crud.user_crud.get_user_by_email(session, email=user_in.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await crud.user_crud.create_user(session=session, user_in=user_in)
    return user


@router.post("/login") 
async def login_for_access_token(
    user_login_data: UserLogin, 
    session: AsyncSession = Depends(get_session),
):
    """Logs in a user via JSON payload and returns an access token."""
    user_by_username = await user_crud.get_user_by_username(session, username=user_login_data.loginIdentifier)
    user_by_email = None
    if not user_by_username:
         user_by_email = await user_crud.get_user_by_email(session, email=user_login_data.loginIdentifier)

    user = user_by_username or user_by_email 
    print(user_login_data, user)
    
    if not user or not security.verify_password(user_login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    user_read = UserRead.model_validate(user)
    return {"access_token": access_token, "token_type": "bearer", "user": user_read}


@router.get("/profile", response_model=UserRead)
async def read_users_me(
    current_user: UserRead = Depends(get_current_user)
):
    """Gets the profile of the currently authenticated user."""
    return current_user