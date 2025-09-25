# routers/music.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File, Form
)
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional, Annotated # Use Annotated for Form metadata in newer FastAPI

from models import MusicMetadataSchema, MusicMetadataCreate # Import schemas
from supabase_crud import (
    get_all_music_metadata_supabase, 
    get_music_metadata_by_id_supabase, 
    get_music_content_by_id_supabase,
    create_music_content_supabase,
    create_music_metadata_supabase
)

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED) # Using /upload instead of /upload-music
async def upload_music(
    # Use Annotated for clearer Form field definitions
    title: Annotated[str, Form()],
    artist: Annotated[str, Form()],
    album: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    cover: Annotated[Optional[UploadFile], File()] = None, # Make cover optional
):
    """Uploads music file and its metadata."""
    if not file.content_type or not file.content_type.startswith("audio/"): # More generic audio check
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Expected audio/*.")

    try:
        # Read file content
        file_content = await file.read()
        cover_content = await cover.read() if cover else None

        # Create content entry first using Supabase
        db_content = await create_music_content_supabase(binary_data=file_content)
        if not db_content:
            raise HTTPException(status_code=500, detail="Failed to create music content")

        # Create metadata entry, linking to content using Supabase
        music_metadata = await create_music_metadata_supabase(
            content_id=db_content["id"],
            title=title,
            artist=artist,
            album=album,
            cover_image=cover_content
        )
        if not music_metadata:
            raise HTTPException(status_code=500, detail="Failed to create music metadata")

        # Return metadata using the schema
        return MusicMetadataSchema.model_validate(music_metadata)

    except Exception as e:
        print(f"Error uploading music: {e}") # Log the error server-side
        raise HTTPException(status_code=500, detail=f"Internal server error during music upload: {e}")

@router.get("/stream/{music_id}")
async def stream_music(music_id: int):
    """Streams the audio content of a specific music track."""
    # Get music metadata
    music = await get_music_metadata_by_id_supabase(music_id=music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Music metadata not found")

    # Get music content using content_id from metadata
    content_id = music.get("content_id")
    if not content_id:
        raise HTTPException(status_code=404, detail="Music content ID not found")
    
    audio_data = await get_music_content_by_id_supabase(content_id=content_id)
    if not audio_data:
        raise HTTPException(status_code=404, detail="Music content not found")

    # Basic streaming headers
    headers = {
        "content-type": "audio/mpeg", # Assuming MP3, adjust if needed
        "accept-ranges": "bytes",
        "content-length": str(len(audio_data)),
    }
    # Use simple iterator for StreamingResponse
    return StreamingResponse(iter([audio_data]), headers=headers, media_type="audio/mpeg")


@router.get("/", response_model=List[MusicMetadataSchema])
async def list_music(
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of music metadata entries."""
    music_list = await get_all_music_metadata_supabase(skip=skip, limit=limit)
    # Validate each item against the response schema
    return [MusicMetadataSchema.model_validate(music) for music in music_list]

@router.get("/{music_id}", response_model=MusicMetadataSchema)
async def get_single_music(music_id: int):
    """Retrieves metadata for a single music track."""
    music = await get_music_metadata_by_id_supabase(music_id=music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Music metadata not found")
    # No need to check music_content here, just return metadata
    return MusicMetadataSchema.model_validate(music)