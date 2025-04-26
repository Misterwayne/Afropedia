# routers/music.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File, Form
)
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional, Annotated # Use Annotated for Form metadata in newer FastAPI

from models import MusicMetadataSchema, MusicMetadataCreate # Import schemas
from crud import music_crud # Import music CRUD functions
from database import get_session

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED) # Using /upload instead of /upload-music
async def upload_music(
    # Use Annotated for clearer Form field definitions
    title: Annotated[str, Form()],
    artist: Annotated[str, Form()],
    album: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    cover: Annotated[Optional[UploadFile], File()] = None, # Make cover optional
    db: AsyncSession = Depends(get_session)
):
    """Uploads music file and its metadata."""
    if not file.content_type or not file.content_type.startswith("audio/"): # More generic audio check
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Expected audio/*.")

    try:
        # Read file content
        file_content = await file.read()
        cover_content = await cover.read() if cover else None

        # Create content entry first
        db_content = await music_crud.create_music_content(session=db, binary_data=file_content)

        # Prepare metadata DTO
        metadata_in = MusicMetadataCreate(title=title, artist=artist, album=album) # content_id set in crud

        # Create metadata entry, linking to content
        music_metadata = await music_crud.create_music_metadata(
            session=db,
            metadata_in=metadata_in,
            content_id=db_content.id,
            cover_image=cover_content
        )

        # Return metadata using the schema
        return MusicMetadataSchema.model_validate(music_metadata)

    except Exception as e:
        await db.rollback() # Ensure rollback on any error during the process
        print(f"Error uploading music: {e}") # Log the error server-side
        raise HTTPException(status_code=500, detail=f"Internal server error during music upload: {e}")

@router.get("/stream/{music_id}")
async def stream_music(music_id: int, db: AsyncSession = Depends(get_session)):
    """Streams the audio content of a specific music track."""
    music = await music_crud.get_music_metadata_by_id(session=db, music_id=music_id)

    if not music or not music.music_content or not music.music_content.binary_data:
        raise HTTPException(status_code=404, detail="Music content not found")

    audio_data = music.music_content.binary_data
    # Basic streaming, not handling Range requests here
    # You'll need more complex logic for true byte range streaming
    headers = {
        "content-type": "audio/mpeg", # Assuming MP3, adjust if needed
        "accept-ranges": "bytes",
        "content-length": str(len(audio_data)),
    }
    # Use simple iterator for StreamingResponse
    return StreamingResponse(iter([audio_data]), headers=headers, media_type="audio/mpeg")


@router.get("/", response_model=List[MusicMetadataSchema])
async def list_music(
    db: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of music metadata entries."""
    music_list = await music_crud.get_all_music_metadata(session=db, skip=skip, limit=limit)
    # Validate each item against the response schema
    return [MusicMetadataSchema.model_validate(music) for music in music_list]

@router.get("/{music_id}", response_model=MusicMetadataSchema)
async def get_single_music(music_id: int, db: AsyncSession = Depends(get_session)):
    """Retrieves metadata for a single music track."""
    music = await music_crud.get_music_metadata_by_id(session=db, music_id=music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Music metadata not found")
    # No need to check music_content here, just return metadata
    return MusicMetadataSchema.model_validate(music)