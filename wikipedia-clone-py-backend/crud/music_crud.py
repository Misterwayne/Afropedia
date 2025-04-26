# crud/music_crud.py
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload # For eager loading equivalent
from models import MusicMetadata, MusicContent, MusicMetadataCreate
from typing import List, Optional

async def create_music_content(session: AsyncSession, binary_data: bytes) -> MusicContent:
    db_content = MusicContent(binary_data=binary_data)
    session.add(db_content)
    await session.flush() # Get ID
    await session.refresh(db_content)
    return db_content
# FIX: Function uses the correct Create schema and sets content_id explicitly
async def create_music_metadata(session: AsyncSession, metadata_in: MusicMetadataCreate, content_id: int, cover_image: Optional[bytes]) -> MusicMetadata:
    data = metadata_in.model_dump()
    print(f"Attempting to create music metadata linked to content ID {content_id} metadata {data}")
    # Create the DB model instance
    db_metadata = MusicMetadata(
        # Unpack fields from the Create schema (title, artist, album)
        **metadata_in.model_dump(),
        # Explicitly set the foreign key using the argument passed to this function
        content_id=content_id,
        # Set the cover image bytes
        cover_image=cover_image
        # ID is auto-generated
    )
    session.add(db_metadata)
    try:
        await session.commit()
        await session.refresh(db_metadata)
        print(f"Successfully created metadata ID {db_metadata.id} linked to content ID {db_metadata.content_id}")
        return db_metadata
    except Exception as e:
        print(f"!!! Error during commit/refresh for music metadata: {e}")
        await session.rollback()
        raise

async def get_music_metadata_by_id(session: AsyncSession, music_id: int) -> Optional[MusicMetadata]:
    print(f"[CRUD] Fetching music metadata ID: {music_id} with content eager load")
    # Ensure selectinload is applied correctly
    statement = select(MusicMetadata).options(
        selectinload(MusicMetadata.music_content) # Eager load the related MusicContent
    ).where(MusicMetadata.id == music_id)

    result = await session.execute(statement)
    music = result.scalar_one_or_none()

    if music:
        print(f"[CRUD] Found metadata ID: {music.id}. Checking loaded content...")
        # This access should ideally NOT trigger a lazy load now
        if music.music_content:
            print(f"[CRUD]   - MusicContent ID: {music.music_content.id} seems loaded.")
            # You could even check binary_data length here for debugging, but be careful with large files
            # print(f"[CRUD]   - Binary data length (check): {len(music.music_content.binary_data) if music.music_content.binary_data else 'None'}")
        else:
            print(f"[CRUD]   - !!! Warning: MusicContent relationship was NOT loaded despite selectinload.")
    else:
         print(f"[CRUD] Metadata ID: {music_id} not found.")

    return music # Return the potentially populated object

async def get_all_music_metadata(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[MusicMetadata]:
    statement = select(MusicMetadata).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()