# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # For standard login form
from sqlmodel.ext.asyncio.session import AsyncSession # Use AsyncSession
from datetime import timedelta
import crud
import logging
from config import settings
from crud import user_crud
from models import UserRead, UserCreate, UserLogin
from database import get_session
from auth import security
from auth.dependencies import get_current_user # Import the dependency
from auth_supabase import get_user_by_username_supabase, get_user_by_email_supabase, create_user_supabase

logger = logging.getLogger("afropedia.auth")
router = APIRouter()

@router.post("/register", response_model=UserRead)
async def register_user(
    user_in: UserCreate
):
    """Registers a new user."""
    existing_user = await get_user_by_username_supabase(user_in.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    existing_email = await get_user_by_email_supabase(user_in.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user_supabase(user_in)
    return UserRead.model_validate(user)


@router.post("/login") 
async def login_for_access_token(
    user_login_data: UserLogin
):
    """Logs in a user via JSON payload and returns an access token."""
    user_by_username = await get_user_by_username_supabase(user_login_data.loginIdentifier)
    user_by_email = None
    if not user_by_username:
         user_by_email = await get_user_by_email_supabase(user_login_data.loginIdentifier)

    user = user_by_username or user_by_email 
    # Log authentication attempt (remove debug prints for production)
    logger.info(f"Login attempt for: {user_login_data.loginIdentifier}")
    
    if not user or not security.verify_password(user_login_data.password, user.hashed_password):
        logger.warning(f"Authentication failed for: {user_login_data.loginIdentifier}")
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

@router.patch("/profile", response_model=UserRead)
async def update_user_profile(
    profile_update: dict,
    current_user: UserRead = Depends(get_current_user)
):
    """Updates the profile of the currently authenticated user."""
    # For now, return the current user as profile updates aren't fully implemented
    # TODO: Implement actual profile update in database
    return current_user