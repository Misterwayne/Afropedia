# routers/moderation.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from auth.dependencies import get_current_user
from models import User
from moderation_models import (
    ModerationQueue, ModerationQueueCreate, ModerationQueueUpdate,
    PeerReview, PeerReviewCreate, PeerReviewUpdate,
    ModerationAction, ModerationActionCreate,
    ContentFlag, ContentFlagCreate, ContentFlagUpdate,
    UserPermission, UserPermissionCreate,
    ApproveContentRequest, RejectContentRequest,
    ModerationStatus, ReviewStatus, Priority, ActionType, FlagType
)
from crud.moderation_crud import (
    create_moderation_queue_item, get_moderation_queue_items, update_moderation_queue_item,
    create_peer_review, get_peer_reviews_for_revision, get_peer_reviews_by_reviewer, update_peer_review,
    create_moderation_action, get_moderation_actions,
    create_content_flag, get_content_flags as crud_get_content_flags, update_content_flag,
    create_user_permission, get_user_permissions, check_user_permission,
    submit_for_moderation, assign_moderation_item, approve_content, reject_content, flag_content,
    get_pending_revisions_for_review, create_peer_review_for_revision, complete_peer_review_evaluation, 
    get_revision_review_summary, auto_approve_revision_if_consensus
)

router = APIRouter()

# Simplified permission dependency - allow all authenticated users for now
def require_moderation_access(current_user: User = Depends(get_current_user)):
    """Require user to be authenticated (simplified for now)"""
    return current_user

# Temporary: Allow unauthenticated access for testing
def allow_all_access():
    """Temporary: Allow all access for testing"""
    return {"id": 1, "username": "test", "email": "test@example.com"}

# Moderation Queue Endpoints
@router.post("/queue", response_model=ModerationQueue)
async def create_moderation_queue(
    item: ModerationQueueCreate,
    current_user: User = Depends(require_moderation_access)
):
    """Create a new moderation queue item"""
    result = await create_moderation_queue_item(item)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create moderation queue item")
    return result

@router.get("/queue", response_model=List[ModerationQueue])
async def get_moderation_queue(
    status: Optional[ModerationStatus] = Query(None),
    assigned_to: Optional[int] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get moderation queue items"""
    return await get_moderation_queue_items(status, assigned_to, limit, offset)

@router.patch("/queue/{item_id}", response_model=ModerationQueue)
async def update_moderation_queue(
    item_id: int,
    update_data: ModerationQueueUpdate,
    current_user: User = Depends(require_moderation_access)
):
    """Update a moderation queue item"""
    result = await update_moderation_queue_item(item_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Moderation queue item not found")
    return result

@router.post("/queue/{item_id}/assign")
async def assign_moderation_item(
    item_id: int,
    assigned_to: int,
    current_user: User = Depends(require_moderation_access)
):
    """Assign a moderation item to a moderator"""
    result = await assign_moderation_item(item_id, assigned_to)
    if not result:
        raise HTTPException(status_code=404, detail="Moderation queue item not found")
    return {"message": "Item assigned successfully"}

# Peer Review Endpoints
@router.post("/reviews", response_model=PeerReview)
async def create_peer_review(
    review: PeerReviewCreate,
    current_user: User = Depends(require_moderation_access)
):
    """Create a new peer review"""
    result = await create_peer_review(review)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create peer review")
    return result

@router.get("/reviews/revision/{revision_id}", response_model=List[PeerReview])
async def get_revision_reviews(
    revision_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get all peer reviews for a specific revision"""
    return await get_peer_reviews_for_revision(revision_id)

@router.get("/reviews/reviewer/{reviewer_id}", response_model=List[PeerReview])
async def get_reviewer_reviews(
    reviewer_id: int,
    current_user: User = Depends(require_moderation_access)
):
    """Get all peer reviews by a specific reviewer"""
    return await get_peer_reviews_by_reviewer(reviewer_id)

@router.patch("/reviews/{review_id}", response_model=PeerReview)
async def update_peer_review(
    review_id: int,
    update_data: PeerReviewUpdate,
    current_user: User = Depends(require_moderation_access)
):
    """Update a peer review"""
    result = await update_peer_review(review_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Peer review not found")
    return result

# Moderation Actions Endpoints
@router.post("/actions", response_model=ModerationAction)
async def create_moderation_action(
    action: ModerationActionCreate,
    current_user: User = Depends(require_moderation_access)
):
    """Create a new moderation action"""
    result = await create_moderation_action(action)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create moderation action")
    return result

@router.get("/actions", response_model=List[ModerationAction])
async def get_moderation_actions(
    moderator_id: Optional[int] = Query(None),
    content_type: Optional[str] = Query(None),
    content_id: Optional[int] = Query(None),
    limit: int = Query(50, le=100),
    current_user: User = Depends(require_moderation_access)
):
    """Get moderation actions with optional filters"""
    return await get_moderation_actions(moderator_id, content_type, content_id, limit)

# Content Flags Endpoints
@router.post("/flags", response_model=ContentFlag)
async def create_content_flag(
    flag: ContentFlagCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new content flag"""
    result = await create_content_flag(flag)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create content flag")
    return result

@router.get("/flags", response_model=List[ContentFlag])
async def get_content_flags(
    status: Optional[str] = Query(None),
    flag_type: Optional[FlagType] = Query(None),
    limit: int = Query(50, le=100)
):
    """Get content flags with optional filters"""
    return await crud_get_content_flags(status, flag_type, limit)

@router.patch("/flags/{flag_id}", response_model=ContentFlag)
async def update_content_flag(
    flag_id: int,
    update_data: ContentFlagUpdate,
    current_user: User = Depends(require_moderation_access)
):
    """Update a content flag"""
    result = await update_content_flag(flag_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Content flag not found")
    return result

# User Permissions Endpoints
@router.post("/permissions", response_model=UserPermission)
async def create_user_permission(
    permission: UserPermissionCreate,
    current_user: User = Depends(require_moderation_access)
):
    """Create a new user permission"""
    result = await create_user_permission(permission)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create user permission")
    return result

@router.get("/permissions/{user_id}", response_model=List[UserPermission])
async def get_user_permissions_endpoint(
    user_id: int,
    current_user: User = Depends(require_moderation_access)
):
    """Get all permissions for a user"""
    return await get_user_permissions(user_id)

# Workflow Endpoints
@router.post("/submit")
async def submit_content_for_moderation(
    content_type: str,
    content_id: int,
    priority: Priority = Priority.NORMAL,
    current_user: User = Depends(get_current_user)
):
    """Submit content for moderation"""
    result = await submit_for_moderation(content_type, content_id, current_user.id, priority)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to submit content for moderation")
    return {"message": "Content submitted for moderation", "queue_item_id": result.id}

@router.post("/approve")
async def approve_content_endpoint(
    request: ApproveContentRequest,
    current_user: User = Depends(require_moderation_access)
):
    """Approve content"""
    success = await approve_content(request.content_type, request.content_id, current_user.id, request.reason)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to approve content")
    return {"message": "Content approved successfully"}

@router.post("/reject")
async def reject_content_endpoint(
    request: RejectContentRequest,
    current_user: User = Depends(require_moderation_access)
):
    """Reject content"""
    success = await reject_content(request.content_type, request.content_id, current_user.id, request.reason)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reject content")
    return {"message": "Content rejected successfully"}

# Peer Review Workflow Endpoints (No Assignment - All Editors Can Review)
@router.get("/pending-revisions")
async def get_pending_revisions(
    current_user: User = Depends(require_moderation_access)
):
    """Get all pending revisions that need peer review"""
    revisions = await get_pending_revisions_for_review()
    return revisions

@router.post("/start-review/{revision_id}")
async def start_peer_review(
    revision_id: int,
    current_user: User = Depends(require_moderation_access)
):
    """Start a peer review for a revision (any editor can do this)"""
    review = await create_peer_review_for_revision(revision_id, current_user.id)
    if not review:
        raise HTTPException(status_code=400, detail="Review already exists or failed to create")
    return {"message": "Peer review started", "review_id": review.id}

@router.post("/complete-review/{review_id}")
async def complete_review_endpoint(
    review_id: int,
    status: ReviewStatus,
    score: Optional[int] = None,
    feedback: Optional[str] = None,
    current_user: User = Depends(require_moderation_access)
):
    """Complete a peer review evaluation"""
    review = await complete_peer_review_evaluation(review_id, status, score, feedback)
    if not review:
        raise HTTPException(status_code=400, detail="Failed to complete review")
    
    # Check if revision should be auto-approved
    if review.revision_id:
        await auto_approve_revision_if_consensus(review.revision_id)
    
    return {"message": "Review completed successfully", "review": review}

@router.get("/revision-summary/{revision_id}")
async def get_revision_summary(
    revision_id: int,
    current_user: User = Depends(require_moderation_access)
):
    """Get review summary for a revision"""
    summary = await get_revision_review_summary(revision_id)
    return summary

@router.post("/flag")
async def flag_content_endpoint(
    content_type: str,
    content_id: int,
    flag_type: FlagType,
    reason: str,
    current_user: User = Depends(get_current_user)
):
    """Flag content for review"""
    result = await flag_content(content_type, content_id, current_user.id, flag_type, reason)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to flag content")
    return {"message": "Content flagged successfully", "flag_id": result.id}

# Dashboard Endpoints
@router.get("/dashboard/stats")
async def get_moderation_dashboard_stats():
    """Get moderation dashboard statistics"""
    try:
        # Get counts for different statuses
        pending_queue = await get_moderation_queue_items(ModerationStatus.PENDING, limit=1000)
        in_review_queue = await get_moderation_queue_items(ModerationStatus.IN_REVIEW, limit=1000)
        pending_flags = await crud_get_content_flags(status="pending", limit=1000)
        
        return {
            "pending_moderation": len(pending_queue),
            "in_review": len(in_review_queue),
            "pending_flags": len(pending_flags),
            "total_queue_items": len(pending_queue) + len(in_review_queue)
        }
    except Exception as e:
        # If moderation tables don't exist, return empty stats
        if "Could not find the table" in str(e):
            return {
                "pending_moderation": 0,
                "in_review": 0,
                "pending_flags": 0,
                "total_queue_items": 0
            }
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard stats: {str(e)}")

@router.get("/dashboard/recent-actions")
async def get_recent_moderation_actions(
    limit: int = Query(10, le=50),
    current_user: User = Depends(require_moderation_access)
):
    """Get recent moderation actions"""
    return await get_moderation_actions(limit=limit)
