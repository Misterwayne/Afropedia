# crud/video_crud.py
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from models import VideoMetadata, VideoContent, VideoMetadataCreate
from typing import List, Optional

async def create_video_content(session: AsyncSession, binary_data: bytes) -> VideoContent:
    db_content = VideoContent(binary_data=binary_data)
    session.add(db_content)
    await session.flush()
    await session.refresh(db_content)
    return db_content

async def create_video_metadata(session: AsyncSession, metadata_in: VideoMetadataCreate, content_id: int) -> VideoMetadata:
    # Assuming 'user' is handled directly in the schema or passed if linked to User model
    db_metadata = VideoMetadata(
        **metadata_in.model_dump(),
        content_id=content_id
    )
    session.add(db_metadata)
    await session.commit()
    await session.refresh(db_metadata)
    return db_metadata

async def get_video_metadata_by_id(session: AsyncSession, video_id: int) -> Optional[VideoMetadata]:
    statement = select(VideoMetadata).where(VideoMetadata.id == video_id).options(selectinload(VideoMetadata.content))
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_all_video_metadata(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[VideoMetadata]:
    statement = select(VideoMetadata).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()