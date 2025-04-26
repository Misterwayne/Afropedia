from sqlmodel import create_engine, SQLModel, Session
from sqlmodel.ext.asyncio.session import AsyncSession # Import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine # Use async engine
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import ssl

import os # Import os to construct path

from config import settings

# Construct the path to the certificate file relative to this script's dir
# Or use an absolute path if preferred/configured elsewhere
current_dir = os.path.dirname(__file__)
ca_cert_path = os.path.join(current_dir, 'cert', 'prod-ca-2021.crt') # Adjust filename if needed
# Alternatively, define the path in your .env/config
# Create an SSL context that uses the specific CA certificate
try:
    ssl_context = ssl.create_default_context(cafile=ca_cert_path)
    # Optional: Add stricter checks if needed, but defaults are usually okay
    # ssl_context.check_hostname = True
    # ssl_context.verify_mode = ssl.CERT_REQUIRED
    connect_args = {"ssl": ssl_context}
    print(f"Using SSL context with CA cert: {ca_cert_path}")
except FileNotFoundError:
    print(f"!!! WARNING: CA Certificate not found at {ca_cert_path}. SSL connection might fail or be insecure. Trying default SSL...")
    # Fallback to simpler ssl=True if CA file is missing, but log a warning
    connect_args = {"ssl": True}
except Exception as e:
     print(f"!!! ERROR creating SSL context: {e}. Trying default SSL...")
     connect_args = {"ssl": True}


# Create an async engine
async_engine = create_async_engine(
    settings.database_url,
    echo=True,
    future=True,
    connect_args=connect_args,
)

# Async Session Maker
AsyncSessionLocal = sessionmaker(
    bind=async_engine, class_=AsyncSession, expire_on_commit=False
)

# Dependency to get DB session in path operations
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session