# routers/sources.py
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from models import Source, SourceCreate, SourceRead, SourceUpdate, Reference, ReferenceCreate, ReferenceRead, ReferenceUpdate, UserRead
from auth.dependencies import get_current_user
from supabase_crud import (
    create_source_supabase, get_source_by_id_supabase, get_sources_by_article_supabase,
    update_source_supabase, delete_source_supabase, create_reference_supabase,
    get_references_by_article_supabase, update_reference_supabase, delete_reference_supabase,
    renumber_references_supabase
)
from datetime import datetime

router = APIRouter()

# --- Source Endpoints ---
@router.get("/", response_model=List[SourceRead])
async def get_sources(
    current_user: UserRead = Depends(get_current_user)
):
    """Get all sources"""
    try:
        # For now, return empty list since we don't have a general sources endpoint
        # This is mainly for the frontend to check if the endpoint exists
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sources: {str(e)}")

@router.post("/", response_model=SourceRead)
async def create_source(
    source: SourceCreate,
    current_user: UserRead = Depends(get_current_user)
):
    """Create a new source"""
    source_data = {
        "title": source.title,
        "url": source.url,
        "author": source.author,
        "publication": source.publication,
        "publication_date": source.publication_date.isoformat() if source.publication_date else None,
        "access_date": source.access_date.isoformat() if source.access_date else None,
        "source_type": source.source_type,
        "isbn": source.isbn,
        "doi": source.doi,
        "description": source.description,
        "created_by": current_user.id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    created_source = await create_source_supabase(source_data)
    if not created_source:
        raise HTTPException(status_code=500, detail="Failed to create source")
    
    return SourceRead(
        id=created_source["id"],
        title=created_source["title"],
        url=created_source["url"],
        author=created_source["author"],
        publication=created_source["publication"],
        publication_date=created_source["publication_date"],
        access_date=created_source["access_date"],
        source_type=created_source["source_type"],
        isbn=created_source["isbn"],
        doi=created_source["doi"],
        description=created_source["description"],
        created_at=created_source["created_at"],
        updated_at=created_source["updated_at"],
        created_by=created_source["created_by"]
    )

@router.get("/{source_id}/", response_model=SourceRead)
async def get_source(
    source_id: int,
    current_user: UserRead = Depends(get_current_user)
):
    """Get a source by ID"""
    source = await get_source_by_id_supabase(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return SourceRead(
        id=source["id"],
        title=source["title"],
        url=source["url"],
        author=source["author"],
        publication=source["publication"],
        publication_date=source["publication_date"],
        access_date=source["access_date"],
        source_type=source["source_type"],
        isbn=source["isbn"],
        doi=source["doi"],
        description=source["description"],
        created_at=source["created_at"],
        updated_at=source["updated_at"],
        created_by=source["created_by"]
    )

@router.put("/{source_id}/", response_model=SourceRead)
async def update_source(
    source_id: int,
    source_update: SourceUpdate,
    current_user: UserRead = Depends(get_current_user)
):
    """Update a source"""
    # Get existing source
    existing_source = await get_source_by_id_supabase(source_id)
    if not existing_source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # Check if user can edit (creator or admin/moderator)
    if existing_source["created_by"] != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this source")
    
    # Prepare update data
    update_data = {}
    if source_update.title is not None:
        update_data["title"] = source_update.title
    if source_update.url is not None:
        update_data["url"] = source_update.url
    if source_update.author is not None:
        update_data["author"] = source_update.author
    if source_update.publication is not None:
        update_data["publication"] = source_update.publication
    if source_update.publication_date is not None:
        update_data["publication_date"] = source_update.publication_date.isoformat()
    if source_update.access_date is not None:
        update_data["access_date"] = source_update.access_date.isoformat()
    if source_update.source_type is not None:
        update_data["source_type"] = source_update.source_type
    if source_update.isbn is not None:
        update_data["isbn"] = source_update.isbn
    if source_update.doi is not None:
        update_data["doi"] = source_update.doi
    if source_update.description is not None:
        update_data["description"] = source_update.description
    
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    updated_source = await update_source_supabase(source_id, update_data)
    if not updated_source:
        raise HTTPException(status_code=500, detail="Failed to update source")
    
    return SourceRead(
        id=updated_source["id"],
        title=updated_source["title"],
        url=updated_source["url"],
        author=updated_source["author"],
        publication=updated_source["publication"],
        publication_date=updated_source["publication_date"],
        access_date=updated_source["access_date"],
        source_type=updated_source["source_type"],
        isbn=updated_source["isbn"],
        doi=updated_source["doi"],
        description=updated_source["description"],
        created_at=updated_source["created_at"],
        updated_at=updated_source["updated_at"],
        created_by=updated_source["created_by"]
    )

@router.delete("/{source_id}/")
async def delete_source(
    source_id: int,
    current_user: UserRead = Depends(get_current_user)
):
    """Delete a source"""
    # Get existing source
    existing_source = await get_source_by_id_supabase(source_id)
    if not existing_source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # Check if user can delete (creator or admin/moderator)
    if existing_source["created_by"] != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this source")
    
    success = await delete_source_supabase(source_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete source")
    
    return {"message": "Source deleted successfully"}

# --- Reference Endpoints ---
@router.post("/articles/{article_id}/references/", response_model=ReferenceRead)
async def create_reference(
    article_id: int,
    reference: ReferenceCreate,
    current_user: UserRead = Depends(get_current_user)
):
    """Create a new reference for an article"""
    # Get the next reference number for this article
    existing_refs = await get_references_by_article_supabase(article_id)
    next_ref_number = len(existing_refs) + 1
    
    reference_data = {
        "article_id": article_id,
        "source_id": reference.source_id,
        "reference_number": next_ref_number,
        "context": reference.context,
        "page_number": reference.page_number,
        "section": reference.section,
        "created_by": current_user.id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    created_reference = await create_reference_supabase(reference_data)
    if not created_reference:
        raise HTTPException(status_code=500, detail="Failed to create reference")
    
    # Get the source data
    source = await get_source_by_id_supabase(reference.source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return ReferenceRead(
        id=created_reference["id"],
        article_id=created_reference["article_id"],
        source_id=created_reference["source_id"],
        reference_number=created_reference["reference_number"],
        context=created_reference["context"],
        page_number=created_reference["page_number"],
        section=created_reference["section"],
        created_at=created_reference["created_at"],
        created_by=created_reference["created_by"],
        source=SourceRead(
            id=source["id"],
            title=source["title"],
            url=source["url"],
            author=source["author"],
            publication=source["publication"],
            publication_date=source["publication_date"],
            access_date=source["access_date"],
            source_type=source["source_type"],
            isbn=source["isbn"],
            doi=source["doi"],
            description=source["description"],
            created_at=source["created_at"],
            updated_at=source["updated_at"],
            created_by=source["created_by"]
        )
    )

@router.get("/articles/{article_id}/references/", response_model=List[ReferenceRead])
async def get_article_references(
    article_id: int,
    current_user: UserRead = Depends(get_current_user)
):
    """Get all references for an article"""
    references = await get_references_by_article_supabase(article_id)
    
    result = []
    for ref in references:
        source_data = ref.get("source", {})
        result.append(ReferenceRead(
            id=ref["id"],
            article_id=ref["article_id"],
            source_id=ref["source_id"],
            reference_number=ref["reference_number"],
            context=ref["context"],
            page_number=ref["page_number"],
            section=ref["section"],
            created_at=ref["created_at"],
            created_by=ref["created_by"],
            source=SourceRead(
                id=source_data["id"],
                title=source_data["title"],
                url=source_data["url"],
                author=source_data["author"],
                publication=source_data["publication"],
                publication_date=source_data["publication_date"],
                access_date=source_data["access_date"],
                source_type=source_data["source_type"],
                isbn=source_data["isbn"],
                doi=source_data["doi"],
                description=source_data["description"],
                created_at=source_data["created_at"],
                updated_at=source_data["updated_at"],
                created_by=source_data["created_by"]
            )
        ))
    
    return result

@router.put("/references/{reference_id}/", response_model=ReferenceRead)
async def update_reference(
    reference_id: int,
    reference_update: ReferenceUpdate,
    current_user: UserRead = Depends(get_current_user)
):
    """Update a reference"""
    # Get existing reference
    existing_refs = await get_references_by_article_supabase(0)  # We need a different approach
    # For now, we'll implement this later with a proper get_reference_by_id function
    
    update_data = {}
    if reference_update.source_id is not None:
        update_data["source_id"] = reference_update.source_id
    if reference_update.reference_number is not None:
        update_data["reference_number"] = reference_update.reference_number
    if reference_update.context is not None:
        update_data["context"] = reference_update.context
    if reference_update.page_number is not None:
        update_data["page_number"] = reference_update.page_number
    if reference_update.section is not None:
        update_data["section"] = reference_update.section
    
    updated_reference = await update_reference_supabase(reference_id, update_data)
    if not updated_reference:
        raise HTTPException(status_code=500, detail="Failed to update reference")
    
    # Get the source data
    source = await get_source_by_id_supabase(updated_reference["source_id"])
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return ReferenceRead(
        id=updated_reference["id"],
        article_id=updated_reference["article_id"],
        source_id=updated_reference["source_id"],
        reference_number=updated_reference["reference_number"],
        context=updated_reference["context"],
        page_number=updated_reference["page_number"],
        section=updated_reference["section"],
        created_at=updated_reference["created_at"],
        created_by=updated_reference["created_by"],
        source=SourceRead(
            id=source["id"],
            title=source["title"],
            url=source["url"],
            author=source["author"],
            publication=source["publication"],
            publication_date=source["publication_date"],
            access_date=source["access_date"],
            source_type=source["source_type"],
            isbn=source["isbn"],
            doi=source["doi"],
            description=source["description"],
            created_at=source["created_at"],
            updated_at=source["updated_at"],
            created_by=source["created_by"]
        )
    )

@router.delete("/references/{reference_id}/")
async def delete_reference(
    reference_id: int,
    current_user: UserRead = Depends(get_current_user)
):
    """Delete a reference"""
    # Get the reference to find the article_id
    # For now, we'll implement this later with a proper get_reference_by_id function
    
    success = await delete_reference_supabase(reference_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete reference")
    
    # Renumber remaining references
    # await renumber_references_supabase(article_id)
    
    return {"message": "Reference deleted successfully"}
