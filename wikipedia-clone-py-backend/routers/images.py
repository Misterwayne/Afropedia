# routers/images.py
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File
)
from fastapi.responses import StreamingResponse
from typing import Annotated, List

from models import ImageUploadResponse, ImageMetadataRead, ImageMetadataCreate
from supabase_crud import create_image_content_supabase, create_image_metadata_supabase, get_image_content_by_metadata_id_supabase, get_image_metadata_by_id_supabase, get_all_image_metadata_supabase, delete_image_supabase
import io

router = APIRouter()

@router.post("/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image_to_db(
    file: Annotated[UploadFile, File()],
):
    """Handles image file upload, saving content and metadata separately."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Expected image/*.")

    try:
        file_content = await file.read()
        file_size = len(file_content)
        print(f"[Upload DB] Read file content, size: {file_size} bytes")

        # 1. Create the content entry first to get its ID
        db_content = await create_image_content_supabase(binary_data=file_content)
        if not db_content:
            raise HTTPException(status_code=500, detail="Failed to create image content")

        # 2. Create the metadata entry, linking it to the content ID
        db_image_meta = await create_image_metadata_supabase(
            content_id=db_content["id"],
            original_filename=file.filename or "unknown",
            content_type=file.content_type,
            size_bytes=file_size,
        )
        if not db_image_meta:
            raise HTTPException(status_code=500, detail="Failed to create image metadata")
            
        print(f"[Upload DB] Metadata saved with ID: {db_image_meta['id']}")

        # Return metadata confirmation
        return ImageUploadResponse(
            id=db_image_meta["id"],
            filename=db_image_meta["original_filename"],
            content_type=db_image_meta["content_type"],
            size_bytes=db_image_meta["size_bytes"],
        )

    except Exception as e:
        print(f"!!! Image DB Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during image upload: {str(e)}")


@router.get("/stream/{image_meta_id}")
async def stream_image(image_meta_id: int):
    """Streams the image binary data linked to the given metadata ID."""
    try:
        # Get image metadata
        metadata = await get_image_metadata_by_id_supabase(image_meta_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Image metadata not found")
        
        # Get image content using the content_id from metadata
        content = await get_image_content_by_metadata_id_supabase(image_meta_id)
        if not content:
            raise HTTPException(status_code=404, detail="Image content not found")
        
        # Return the binary data as a streaming response
        return StreamingResponse(
            io.BytesIO(content['binary_data']),
            media_type=metadata.get('content_type', 'application/octet-stream'),
            headers={
                "Content-Disposition": f"inline; filename={metadata.get('original_filename', 'image')}"
            }
        )
    except Exception as e:
        print(f"Error streaming image {image_meta_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error streaming image: {str(e)}")


@router.get("/", response_model=List[ImageMetadataRead])
async def list_images(
    skip: int = 0,
    limit: int = 50
):
    """Retrieves a list of image metadata entries."""
    try:
        metadata_list = await get_all_image_metadata_supabase(skip=skip, limit=limit)
        return [ImageMetadataRead.model_validate(metadata) for metadata in metadata_list]
    except Exception as e:
        print(f"Error listing images: {e}")
        raise HTTPException(status_code=500, detail=f"Error listing images: {str(e)}")


@router.get("/{image_meta_id}/meta", response_model=ImageMetadataRead)
async def get_image_meta(image_meta_id: int):
    """Retrieves metadata for a single image."""
    try:
        metadata = await get_image_metadata_by_id_supabase(image_meta_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Image metadata not found")
        return ImageMetadataRead.model_validate(metadata)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting image metadata: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting image metadata: {str(e)}")


@router.delete("/{image_meta_id}", status_code=status.HTTP_200_OK)
async def delete_image_endpoint(image_meta_id: int):
    """Deletes an image (metadata and content)."""
    try:
        success = await delete_image_supabase(image_meta_id)
        if not success:
            raise HTTPException(status_code=404, detail="Image not found")
        return {"message": f"Image {image_meta_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting image: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")
