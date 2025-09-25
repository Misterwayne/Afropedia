# init_db.py
import asyncio
from sqlmodel import SQLModel

# Important: Ensure your database connection string and settings
# are correctly configured in .env and loaded by config.py

# Import the async engine from your database setup file
# Uses absolute import assuming script is run from project root
from database import async_engine

# Import ALL your SQLModel models that have 'table=True'
# This is crucial so that SQLModel.metadata knows about them.
from models import User, Article, Revision, MusicContent, MusicMetadata, VideoContent, VideoMetadata, ImageMetadataBase, ImageContent, Book

async def create_tables():
    """Creates all tables defined in SQLModel metadata."""
    print("Attempting to initialize database tables...")
    async with async_engine.begin() as conn:
        try:
            # Optional: Drop tables first for a clean slate (DEV ONLY!)
            # Use with extreme caution, especially on non-dev DBs.
            # print("Dropping existing tables (if any)...")
            # await conn.run_sync(SQLModel.metadata.drop_all)
            # print("Existing tables dropped.")

            print("Creating tables based on SQLModel metadata...")
            # Create all tables defined in models linked to SQLModel.metadata
            await conn.run_sync(SQLModel.metadata.create_all)
            print("Tables created successfully!")

        except Exception as e:
            print(f"An error occurred during table creation: {e}")
            print("Please check database connection and model definitions.")
            # Optionally re-raise the exception if you want the script to exit with an error code
            # raise

async def main():
    await create_tables()
    # You could add code here to create an initial admin user if needed

if __name__ == "__main__":
    print("Running Database Initializer...")
    # Ensure the virtual environment is active before running this script
    # Verify DATABASE_URL in .env points to the correct database
    asyncio.run(main())
    print("Database Initializer finished.")