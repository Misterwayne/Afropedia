# routers/images.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File
)
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, List

from database import get_session
from crud import image_crud # Import image CRUD
# Import correct schemas based on refactor
from models import ImageUploadResponse, ImageMetadataRead, ImageMetadataCreate
# from auth.dependencies import get_current_user

router = APIRouter()

@router.post("/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image_to_db(
    file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_session),
    # current_user: models.UserRead = Depends(get_current_user)
):
    """Handles image file upload, saving content and metadata separately."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Expected image/*.")

    try:
        file_content = await file.read()
        file_size = len(file_content)
        print(f"[Upload DB] Read file content, size: {file_size} bytes")

        # 1. Create the content entry first to get its ID
        db_content = await image_crud.create_image_content(session=db, binary_data=file_content)

        # 2. Create the metadata entry, linking it to the content ID
        db_image_meta = await image_crud.create_image_metadata(
            session=db,
            content_id=db_content.id, # Pass the generated content ID
            original_filename=file.filename,
            content_type=file.content_type,
            size_bytes=file_size,
            # uploaded_by_user_id=current_user.id,
        )
        print(f"[Upload DB] Metadata saved with ID: {db_image_meta.id}")

        # Return metadata confirmation
        return ImageUploadResponse(
            id=db_image_meta.id, # Return metadata ID
            filename=db_image_meta.original_filename,
            content_type=db_image_meta.content_type,
            size_bytes=db_image_meta.size_bytes,
        )

    except Exception as e:
        print(f"!!! Image DB Upload Error: {e}")
        # Rollback might have already happened in CRUD, but ensures it here too
        try:
            await db.rollback()
        except Exception as rb_exc:
            print(f"Error during rollback: {rb_exc}")
        raise HTTPException(status_code=500, detail=f"Internal server error during image upload.")


@router.get("/stream/{image_meta_id}") # Route parameter is now metadata ID
async def stream_image(image_meta_id: int, db: AsyncSession = Depends(get_session)):
    """Streams the image binary data linked to the given metadata ID."""
    # Fetch the content based on the metadata ID
    db_content = await image_crud.get_image_content_by_metadata_id(session=db, image_id=image_meta_id)

    if not db_content or not db_content.binary_data:
        # Need to fetch metadata separately to get content_type if content is missing
        db_meta = await image_crud.get_image_metadata_by_id(session=db, image_id=image_meta_id)
        if not db_meta:
             raise HTTPException(status_code=404, detail="Image metadata not found")
        else:
             raise HTTPException(status_code=404, detail="Image content data not found")

    # Fetch metadata just to get the content type (can be optimized)
    # A potentially better way is to store content_type also on ImageContent table
    db_meta = await image_crud.get_image_metadata_by_id(session=db, image_id=image_meta_id)
    media_type = db_meta.content_type if db_meta and db_meta.content_type else "image/jpeg" # Default

    return StreamingResponse(iter([db_content.binary_data]), media_type=media_type)


@router.get("/", response_model=List[ImageMetadataRead])
async def list_images(
    db: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 50
):
    """Retrieves a list of image metadata entries."""
    images = await image_crud.get_all_image_metadata(session=db, skip=skip, limit=limit)
    return [ImageMetadataRead.model_validate(img) for img in images]


@router.get("/{image_meta_id}/meta", response_model=ImageMetadataRead)
async def get_image_meta(image_meta_id: int, db: AsyncSession = Depends(get_session)):
    """Retrieves metadata for a single image."""
    img = await image_crud.get_image_metadata_by_id(session=db, image_id=image_meta_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image metadata not found")
    return ImageMetadataRead.model_validate(img)

# Optional: Add delete endpoint
@router.delete("/{image_meta_id}", status_code=status.HTTP_200_OK)
async def delete_image_endpoint(
    image_meta_id: int,
    db: AsyncSession = Depends(get_session),
    # current_user: models.UserRead = Depends(get_current_user) # Add auth
):
    """Deletes an image (metadata and content)."""
    # Add permission checks if using auth
    success = await image_crud.delete_image(session=db, metadata_id=image_meta_id)
    if not success:
        # CRUD function might not have found it, or DB error occurred
        raise HTTPException(status_code=404, detail=f"Image metadata ID {image_meta_id} not found or deletion failed.")
    return {"message": f"Image {image_meta_id} deleted successfully."}