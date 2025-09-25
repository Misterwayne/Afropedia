# routers/video.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File
)
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Annotated 

from models import VideoMetadataSchema, VideoMetadataCreate 
from supabase_crud import (
    get_all_video_metadata_supabase, 
    get_video_metadata_by_id_supabase, 
    get_video_content_by_id_supabase,
    create_video_content_supabase,
    create_video_metadata_supabase
)
from datetime import datetime, timezone

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: Annotated[UploadFile, File()],
):
    """Uploads a video file."""
    if not file.content_type or not file.content_type.startswith("video/"): # Generic video check
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Expected video/*.")

    try:
        file_content = await file.read()

        # Create content entry first using Supabase
        db_content = await create_video_content_supabase(binary_data=file_content)
        if not db_content:
            raise HTTPException(status_code=500, detail="Failed to create video content")

        # Create metadata entry, linking to content using Supabase
        video_metadata = await create_video_metadata_supabase(
            content_id=db_content["id"],
            filename=file.filename or "untitled",
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        if not video_metadata:
            raise HTTPException(status_code=500, detail="Failed to create video metadata")

        return VideoMetadataSchema.model_validate(video_metadata)

    except Exception as e:
        print(f"Error uploading video: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during video upload: {e}")


@router.get("/stream/{video_id}")
async def stream_video(video_id: int):
    """Streams the content of a specific video."""
    # Get video metadata
    video = await get_video_metadata_by_id_supabase(video_id=video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video metadata not found")

    # Get video content using content_id from metadata
    content_id = video.get("content_id")
    if not content_id:
        raise HTTPException(status_code=404, detail="Video content ID not found")
    
    video_data = await get_video_content_by_id_supabase(content_id=content_id)
    if not video_data:
        raise HTTPException(status_code=404, detail="Video content not found")

    headers = {
        "content-type": "video/mp4",
        "accept-ranges": "bytes",
        "content-length": str(len(video_data)),
    }
    return StreamingResponse(iter([video_data]), headers=headers, media_type="video/mp4")


@router.get("/", response_model=List[VideoMetadataSchema])
async def list_videos(
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of video metadata entries."""
    videos = await get_all_video_metadata_supabase(skip=skip, limit=limit)
    return [VideoMetadataSchema.model_validate(video) for video in videos]