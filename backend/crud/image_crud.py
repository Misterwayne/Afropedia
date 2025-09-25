# crud/image_crud.py
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload # Import for eager loading
from models import ImageMetadata, ImageContent, ImageMetadataCreate # Import new models/schemas
from typing import Optional, List

async def create_image_content(session: AsyncSession, binary_data: bytes) -> ImageContent:
    """Creates an entry in the image_content table."""
    db_content = ImageContent(binary_data=binary_data)
    session.add(db_content)
    await session.flush() # Flush to get the auto-generated ID
    await session.refresh(db_content)
    print(f"[CRUD Image] Created ImageContent with ID: {db_content.id}")
    return db_content

async def create_image_metadata(
    session: AsyncSession,
    *,
    content_id: int, # Link to the content
    original_filename: Optional[str],
    content_type: Optional[str],
    size_bytes: Optional[int],
    # uploaded_by_user_id: Optional[int] = None
) -> ImageMetadata:
    """Saves image metadata to the database, linked to content."""
    print(f"[CRUD Image] Creating ImageMetadata linked to Content ID: {content_id}")
    db_image_meta = ImageMetadata(
        original_filename=original_filename,
        content_type=content_type,
        size_bytes=size_bytes,
        content_id=content_id, # Set the foreign key
        # uploaded_by_user_id=uploaded_by_user_id,
    )
    session.add(db_image_meta)
    try:
        await session.commit()
        await session.refresh(db_image_meta)
        print(f"[CRUD Image] Successfully created ImageMetadata ID: {db_image_meta.id}")
        return db_image_meta
    except Exception as e:
        print(f"!!! Error committing ImageMetadata: {e}")
        await session.rollback()
        raise # Re-raise the exception


async def get_image_metadata_by_id(session: AsyncSession, image_id: int) -> Optional[ImageMetadata]:
    """Retrieves image metadata by its ID (optionally load content relationship)."""
    # Typically you don't need the content blob when just fetching metadata
    print(f"[CRUD Image] Getting ImageMetadata for ID: {image_id}")
    statement = select(ImageMetadata).where(ImageMetadata.id == image_id)
    # If you needed the content relation loaded here, add .options(selectinload(ImageMetadata.content))
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_image_content_by_metadata_id(session: AsyncSession, image_id: int) -> Optional[ImageContent]:
    """Retrieves the ImageContent linked to a specific ImageMetadata ID."""
    print(f"[CRUD Image] Getting ImageContent for Metadata ID: {image_id}")
    # Select ImageContent based on the metadata ID relationship
    statement = select(ImageContent).join(ImageMetadata).where(ImageMetadata.id == image_id)
    # Alternative, if you fetch metadata first:
    # metadata = await get_image_metadata_by_id(session, image_id)
    # if not metadata or not metadata.content_id: return None
    # statement = select(ImageContent).where(ImageContent.id == metadata.content_id)

    result = await session.execute(statement)
    content = result.scalar_one_or_none()
    if content:
        print(f"[CRUD Image] Found ImageContent ID: {content.id}")
    else:
        print(f"[CRUD Image] No ImageContent found for Metadata ID: {image_id}")
    return content


async def get_all_image_metadata(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[ImageMetadata]:
    """Retrieves a list of image metadata."""
    print(f"[CRUD Image] Getting all ImageMetadata (skip={skip}, limit={limit})")
    statement = select(ImageMetadata).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()

# Optional: Delete function needs to handle both tables potentially
async def delete_image(session: AsyncSession, metadata_id: int) -> bool:
     print(f"[CRUD Image] Attempting to delete ImageMetadata ID: {metadata_id}")
     db_image_meta = await get_image_metadata_by_id(session, metadata_id)
     if not db_image_meta:
         print(f"[CRUD Image] Metadata ID {metadata_id} not found for deletion.")
         return False # Or raise error

     content_id_to_delete = db_image_meta.content_id
     try:
         # Delete metadata first (FK constraint might prevent content delete otherwise)
         await session.delete(db_image_meta)
         await session.flush() # Process delete in transaction buffer
         print(f"[CRUD Image] Deleted ImageMetadata ID: {metadata_id}")

         # If content was linked, delete it too
         if content_id_to_delete:
             print(f"[CRUD Image] Attempting to delete related ImageContent ID: {content_id_to_delete}")
             # Fetch the content object to delete it
             content_stmt = select(ImageContent).where(ImageContent.id == content_id_to_delete)
             content_result = await session.execute(content_stmt)
             db_content = content_result.scalar_one_or_none()
             if db_content:
                 await session.delete(db_content)
                 print(f"[CRUD Image] Deleted ImageContent ID: {content_id_to_delete}")
             else:
                 print(f"[CRUD Image] Warning: Related ImageContent ID {content_id_to_delete} not found.")

         await session.commit()
         print(f"[CRUD Image] Successfully deleted image (metadata ID: {metadata_id}).")
         return True
     except Exception as e:
         await session.rollback()
         print(f"!!! Error deleting image {metadata_id}: {e}")
         return False