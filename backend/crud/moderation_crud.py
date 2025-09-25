# crud/moderation_crud.py
from typing import List, Optional
from sqlmodel import select, and_, or_
from datetime import datetime
from supabase_client import supabase
from moderation_models import (
    ModerationQueue, ModerationQueueCreate, ModerationQueueUpdate,
    PeerReview, PeerReviewCreate, PeerReviewUpdate,
    ModerationAction, ModerationActionCreate,
    ContentFlag, ContentFlagCreate, ContentFlagUpdate,
    UserPermission, UserPermissionCreate, UserPermissionUpdate,
    ModerationStatus, ReviewStatus, Priority, ActionType, FlagType
)

# Moderation Queue CRUD
async def create_moderation_queue_item(item: ModerationQueueCreate) -> Optional[ModerationQueue]:
    """Create a new moderation queue item"""
    try:
        result = supabase.table("moderation_queue").insert(item.dict()).execute()
        if result.data:
            return ModerationQueue(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating moderation queue item: {e}")
        return None

async def get_moderation_queue_items(
    status: Optional[ModerationStatus] = None,
    assigned_to: Optional[int] = None,
    limit: int = 50,
    offset: int = 0
) -> List[ModerationQueue]:
    """Get moderation queue items with optional filters"""
    try:
        query = supabase.table("moderation_queue").select("*")
        
        if status and hasattr(status, 'value'):
            query = query.eq("status", status.value)
        if assigned_to and isinstance(assigned_to, int):
            query = query.eq("assigned_to", assigned_to)
            
        result = query.order("created_at", desc=True).limit(limit).execute()
        return [ModerationQueue(**item) for item in result.data or []]
    except Exception as e:
        print(f"Error getting moderation queue items: {e}")
        return []

async def update_moderation_queue_item(
    item_id: int, 
    update_data: ModerationQueueUpdate
) -> Optional[ModerationQueue]:
    """Update a moderation queue item"""
    try:
        result = supabase.table("moderation_queue").update(
            update_data.dict(exclude_unset=True)
        ).eq("id", item_id).execute()
        
        if result.data:
            return ModerationQueue(**result.data[0])
        return None
    except Exception as e:
        print(f"Error updating moderation queue item: {e}")
        return None

async def delete_moderation_queue_item(item_id: int) -> bool:
    """Delete a moderation queue item"""
    try:
        result = supabase.table("moderation_queue").delete().eq("id", item_id).execute()
        return len(result.data or []) > 0
    except Exception as e:
        print(f"Error deleting moderation queue item: {e}")
        return False

# Peer Review CRUD
async def create_peer_review(review: PeerReviewCreate) -> Optional[PeerReview]:
    """Create a new peer review"""
    try:
        result = supabase.table("peer_review").insert(review.dict()).execute()
        if result.data:
            return PeerReview(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating peer review: {e}")
        return None

async def get_peer_reviews_for_revision(revision_id: int) -> List[PeerReview]:
    """Get all peer reviews for a specific revision"""
    try:
        result = supabase.table("peer_review").select("*").eq("revision_id", revision_id).execute()
        return [PeerReview(**item) for item in result.data or []]
    except Exception as e:
        print(f"Error getting peer reviews: {e}")
        return []

async def get_peer_reviews_by_reviewer(reviewer_id: int) -> List[PeerReview]:
    """Get all peer reviews by a specific reviewer"""
    try:
        result = supabase.table("peer_review").select("*").eq("reviewer_id", reviewer_id).execute()
        return [PeerReview(**item) for item in result.data or []]
    except Exception as e:
        print(f"Error getting peer reviews by reviewer: {e}")
        return []

async def update_peer_review(
    review_id: int, 
    update_data: PeerReviewUpdate
) -> Optional[PeerReview]:
    """Update a peer review"""
    try:
        result = supabase.table("peer_review").update(
            update_data.dict(exclude_unset=True)
        ).eq("id", review_id).execute()
        
        if result.data:
            return PeerReview(**result.data[0])
        return None
    except Exception as e:
        print(f"Error updating peer review: {e}")
        return None

# Moderation Actions CRUD
async def create_moderation_action(action: ModerationActionCreate) -> Optional[ModerationAction]:
    """Create a new moderation action"""
    try:
        result = supabase.table("moderation_action").insert(action.dict()).execute()
        if result.data:
            return ModerationAction(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating moderation action: {e}")
        return None

async def get_moderation_actions(
    moderator_id: Optional[int] = None,
    content_type: Optional[str] = None,
    content_id: Optional[int] = None,
    limit: int = 50
) -> List[ModerationAction]:
    """Get moderation actions with optional filters"""
    try:
        query = supabase.table("moderation_action").select("*")
        
        if moderator_id:
            query = query.eq("moderator_id", moderator_id)
        if content_type:
            query = query.eq("content_type", content_type)
        if content_id:
            query = query.eq("content_id", content_id)
            
        result = query.order("created_at", desc=True).limit(limit).execute()
        return [ModerationAction(**item) for item in result.data or []]
    except Exception as e:
        print(f"Error getting moderation actions: {e}")
        return []

# Content Flags CRUD
async def create_content_flag(flag: ContentFlagCreate) -> Optional[ContentFlag]:
    """Create a new content flag"""
    try:
        result = supabase.table("content_flag").insert(flag.dict()).execute()
        if result.data:
            return ContentFlag(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating content flag: {e}")
        return None

async def get_content_flags(
    status: Optional[str] = None,
    flag_type: Optional[FlagType] = None,
    limit: int = 50
) -> List[ContentFlag]:
    """Get content flags with optional filters"""
    try:
        query = supabase.table("content_flag").select("*")
        
        if status:
            query = query.eq("status", status)
        if flag_type and hasattr(flag_type, 'value'):
            query = query.eq("flag_type", flag_type.value)
            
        result = query.order("created_at", desc=True).limit(limit).execute()
        return [ContentFlag(**item) for item in result.data or []]
    except Exception as e:
        print(f"Error getting content flags: {e}")
        return []

async def update_content_flag(
    flag_id: int, 
    update_data: ContentFlagUpdate
) -> Optional[ContentFlag]:
    """Update a content flag"""
    try:
        result = supabase.table("content_flag").update(
            update_data.dict(exclude_unset=True)
        ).eq("id", flag_id).execute()
        
        if result.data:
            return ContentFlag(**result.data[0])
        return None
    except Exception as e:
        print(f"Error updating content flag: {e}")
        return None

# User Permissions CRUD
async def create_user_permission(permission: UserPermissionCreate) -> Optional[UserPermission]:
    """Create a new user permission"""
    try:
        result = supabase.table("user_permission").insert(permission.dict()).execute()
        if result.data:
            return UserPermission(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating user permission: {e}")
        return None

async def get_user_permissions(user_id: int) -> List[UserPermission]:
    """Get all permissions for a user"""
    try:
        result = supabase.table("user_permission").select("*").eq("user_id", user_id).eq("is_active", True).execute()
        return [UserPermission(**item) for item in result.data or []]
    except Exception as e:
        print(f"Error getting user permissions: {e}")
        return []

async def check_user_permission(user_id: int, permission: str) -> bool:
    """Check if a user has a specific permission"""
    try:
        result = supabase.table("user_permission").select("*").eq(
            "user_id", user_id
        ).eq("permission", permission).eq("is_active", True).execute()
        
        if result.data:
            # Check if permission has expired
            for perm in result.data:
                if not perm.get("expires_at") or datetime.fromisoformat(perm["expires_at"]) > datetime.utcnow():
                    return True
        return False
    except Exception as e:
        print(f"Error checking user permission: {e}")
        return False

# Moderation Workflow Functions
async def submit_for_moderation(
    content_type: str,
    content_id: int,
    submitted_by: int,
    priority: Priority = Priority.NORMAL
) -> Optional[ModerationQueue]:
    """Submit content for moderation"""
    try:
        item = ModerationQueueCreate(
            content_type=content_type,
            content_id=content_id,
            submitted_by=submitted_by,
            priority=priority
        )
        return await create_moderation_queue_item(item)
    except Exception as e:
        print(f"Error submitting for moderation: {e}")
        return None

async def assign_moderation_item(
    item_id: int,
    assigned_to: int
) -> Optional[ModerationQueue]:
    """Assign a moderation item to a moderator"""
    try:
        update_data = ModerationQueueUpdate(
            assigned_to=assigned_to,
            status=ModerationStatus.IN_REVIEW
        )
        return await update_moderation_queue_item(item_id, update_data)
    except Exception as e:
        print(f"Error assigning moderation item: {e}")
        return None

async def approve_content(
    content_type: str,
    content_id: int,
    moderator_id: int,
    reason: Optional[str] = None
) -> bool:
    """Approve content and create moderation action (admin/moderator final approval)"""
    try:
        # Create moderation action
        action = ModerationActionCreate(
            moderator_id=moderator_id,
            content_type=content_type,
            content_id=content_id,
            action_type=ActionType.APPROVE,
            reason=reason
        )
        await create_moderation_action(action)
        
        # Update content status based on type
        if content_type == "article":
            supabase.table("article").update({"status": "approved"}).eq("id", content_id).execute()
        elif content_type == "revision":
            # Update revision status
            supabase.table("revision").update({
                "status": "approved",
                "is_approved": True,
                "needs_review": False
            }).eq("id", content_id).execute()
            
            # When a revision is approved, update the article's current revision to this approved one
            revision_result = supabase.table("revision").select("article_id").eq("id", content_id).execute()
            if revision_result.data:
                article_id = revision_result.data[0]["article_id"]
                supabase.table("article").update({
                    "current_revision_id": content_id,
                    "status": "approved",
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", article_id).execute()
        
        # Update moderation queue items for this content
        supabase.table("moderation_queue").update({
            "status": "approved"
        }).eq("content_type", content_type).eq("content_id", content_id).execute()
        
        return True
    except Exception as e:
        print(f"Error approving content: {e}")
        return False

async def reject_content(
    content_type: str,
    content_id: int,
    moderator_id: int,
    reason: str
) -> bool:
    """Reject content and create moderation action"""
    try:
        # Create moderation action
        action = ModerationActionCreate(
            moderator_id=moderator_id,
            content_type=content_type,
            content_id=content_id,
            action_type=ActionType.REJECT,
            reason=reason
        )
        await create_moderation_action(action)
        
        # Update content status based on type
        if content_type == "article":
            supabase.table("article").update({"status": "rejected"}).eq("id", content_id).execute()
        elif content_type == "revision":
            # Update revision status
            supabase.table("revision").update({
                "status": "rejected",
                "is_approved": False,
                "needs_review": True
            }).eq("id", content_id).execute()
            
            # When a revision is rejected, the article keeps its current revision
            # but we can optionally update the article status to indicate pending review
            revision_result = supabase.table("revision").select("article_id").eq("id", content_id).execute()
            if revision_result.data:
                article_id = revision_result.data[0]["article_id"]
                supabase.table("article").update({
                    "status": "pending_review"  # Indicate the article has pending changes
                }).eq("id", article_id).execute()
        
        # Update moderation queue items for this content
        supabase.table("moderation_queue").update({
            "status": "rejected"
        }).eq("content_type", content_type).eq("content_id", content_id).execute()
        
        return True
    except Exception as e:
        print(f"Error rejecting content: {e}")
        return False

async def flag_content(
    content_type: str,
    content_id: int,
    flagger_id: int,
    flag_type: FlagType,
    reason: str
) -> Optional[ContentFlag]:
    """Flag content for review"""
    try:
        flag = ContentFlagCreate(
            content_type=content_type,
            content_id=content_id,
            flagger_id=flagger_id,
            flag_type=flag_type,
            reason=reason
        )
        return await create_content_flag(flag)
    except Exception as e:
        print(f"Error flagging content: {e}")
        return None

# Peer Review Workflow Functions (No Assignment - All Editors Can Review)
async def get_pending_revisions_for_review() -> List[dict]:
    """Get all pending revisions that need peer review"""
    try:
        # Get all revisions that need review (status = pending, needs_review = true)
        result = supabase.table("revision").select("""
            id, content, comment, timestamp, article_id, user_id, status, is_approved, needs_review,
            article:article_id(id, title),
            user:user_id(id, username)
        """).eq("needs_review", True).eq("status", "pending").order("timestamp", desc=True).execute()
        
        revisions = []
        for rev_data in result.data or []:
            # Get existing reviews for this revision
            reviews = await get_peer_reviews_for_revision(rev_data["id"])
            
            revisions.append({
                "id": rev_data["id"],
                "content": rev_data["content"],
                "comment": rev_data["comment"],
                "timestamp": rev_data["timestamp"],
                "article_id": rev_data["article_id"],
                "article_title": rev_data["article"]["title"] if rev_data.get("article") else "Unknown",
                "author_username": rev_data["user"]["username"] if rev_data.get("user") else "Anonymous",
                "status": rev_data["status"],
                "existing_reviews": len(reviews),
                "reviews": reviews
            })
        
        return revisions
    except Exception as e:
        print(f"Error getting pending revisions: {e}")
        return []

async def create_peer_review_for_revision(
    revision_id: int,
    reviewer_id: int,
    status: ReviewStatus = ReviewStatus.PENDING
) -> Optional[PeerReview]:
    """Create a peer review for any editor (no assignment needed)"""
    try:
        # Check if this reviewer already reviewed this revision
        existing = await get_peer_reviews_for_revision(revision_id)
        if any(r.reviewer_id == reviewer_id for r in existing):
            return None  # Already reviewed by this user
        
        review = PeerReviewCreate(
            revision_id=revision_id,
            reviewer_id=reviewer_id,
            status=status
        )
        return await create_peer_review(review)
    except Exception as e:
        print(f"Error creating peer review: {e}")
        return None

async def complete_peer_review_evaluation(
    review_id: int,
    status: ReviewStatus,
    score: Optional[int] = None,
    feedback: Optional[str] = None
) -> Optional[PeerReview]:
    """Complete a peer review evaluation"""
    try:
        update_data = PeerReviewUpdate(
            status=status,
            score=score,
            feedback=feedback
        )
        return await update_peer_review(review_id, update_data)
    except Exception as e:
        print(f"Error completing peer review: {e}")
        return None

async def get_revision_review_summary(revision_id: int) -> dict:
    """Get summary of all reviews for a revision"""
    try:
        reviews = await get_peer_reviews_for_revision(revision_id)
        
        total_reviews = len(reviews)
        approved_reviews = len([r for r in reviews if r.status == ReviewStatus.APPROVED])
        rejected_reviews = len([r for r in reviews if r.status == ReviewStatus.REJECTED])
        pending_reviews = len([r for r in reviews if r.status == ReviewStatus.PENDING])
        
        # Calculate average score
        scores = [r.score for r in reviews if r.score is not None]
        average_score = sum(scores) / len(scores) if scores else None
        
        # Determine overall status
        if pending_reviews > 0:
            overall_status = "pending_review"
        elif approved_reviews > rejected_reviews:
            overall_status = "approved"
        elif rejected_reviews > approved_reviews:
            overall_status = "rejected"
        else:
            overall_status = "needs_more_reviews"
        
        return {
            "revision_id": revision_id,
            "total_reviews": total_reviews,
            "approved_reviews": approved_reviews,
            "rejected_reviews": rejected_reviews,
            "pending_reviews": pending_reviews,
            "average_score": average_score,
            "overall_status": overall_status,
            "reviews": reviews
        }
    except Exception as e:
        print(f"Error getting revision review summary: {e}")
        return {
            "revision_id": revision_id,
            "total_reviews": 0,
            "approved_reviews": 0,
            "rejected_reviews": 0,
            "pending_reviews": 0,
            "average_score": None,
            "overall_status": "error",
            "reviews": []
        }

async def auto_approve_revision_if_consensus(revision_id: int) -> bool:
    """Auto-approve revision if there's sufficient positive consensus"""
    try:
        summary = await get_revision_review_summary(revision_id)
        
        total_reviews = summary["total_reviews"]
        approved_reviews = summary["approved_reviews"]
        rejected_reviews = summary["rejected_reviews"]
        
        # New consensus logic: 
        # - Need at least 5 positive reviews
        # - More than 50% approval rate
        # - No pending reviews
        approval_rate = approved_reviews / total_reviews if total_reviews > 0 else 0
        
        if (approved_reviews >= 5 and 
            approval_rate > 0.5 and 
            summary["pending_reviews"] == 0):
            
            # Auto-approve the revision
            supabase.table("revision").update({
                "status": "approved",
                "is_approved": True,
                "needs_review": False
            }).eq("id", revision_id).execute()
            
            # Update article's current revision
            revision_result = supabase.table("revision").select("article_id").eq("id", revision_id).execute()
            if revision_result.data:
                article_id = revision_result.data[0]["article_id"]
                supabase.table("article").update({
                    "current_revision_id": revision_id,
                    "status": "approved",
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", article_id).execute()
            
            # Update moderation queue
            supabase.table("moderation_queue").update({
                "status": "approved"
            }).eq("content_type", "revision").eq("content_id", revision_id).execute()
            
            return True
        
        return False
    except Exception as e:
        print(f"Error in auto-approval check: {e}")
        return False
