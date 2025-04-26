# routers/video.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File
)
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Annotated 

from models import VideoMetadataSchema, VideoMetadataCreate 
from crud import video_crud 
from database import get_session
from datetime import datetime

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_session),
):
    """Uploads a video file."""
    if not file.content_type or not file.content_type.startswith("video/"): # Generic video check
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Expected video/*.")

    try:
        file_content = await file.read()

        db_content = await video_crud.create_video_content(session=db, binary_data=file_content)

        metadata_in = VideoMetadataCreate(
            filename=file.filename or "untitled",
            timestamp=datetime.utcnow(),
        )

        video_metadata = await video_crud.create_video_metadata(
            session=db,
            metadata_in=metadata_in,
            content_id=db_content.id
        )
        return VideoMetadataSchema.model_validate(video_metadata)

    except Exception as e:
        await db.rollback()
        print(f"Error uploading video: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during video upload: {e}")


@router.get("/stream/{video_id}")
async def stream_video(video_id: int, db: AsyncSession = Depends(get_session)):
    """Streams the content of a specific video."""
    video = await video_crud.get_video_metadata_by_id(session=db, video_id=video_id)

    if not video or not video.content or not video.content.binary_data:
        raise HTTPException(status_code=404, detail="Video content not found")

    video_data = video.content.binary_data
    headers = {
        "content-type": "video/mp4",
        "accept-ranges": "bytes",
        "content-length": str(len(video_data)),
    }
    return StreamingResponse(iter([video_data]), headers=headers, media_type="video/mp4")


@router.get("/", response_model=List[VideoMetadataSchema])
async def list_videos(
    db: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of video metadata entries."""
    videos = await video_crud.get_all_video_metadata(session=db, skip=skip, limit=limit)
    return [VideoMetadataSchema.model_validate(video) for video in videos]