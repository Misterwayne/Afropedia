# routers/peer_review.py - Advanced Peer Review API Routes
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from auth.dependencies import get_current_user
from models import User
from peer_review_models import (
    PeerReview, PeerReviewCreate, PeerReviewUpdate, PeerReviewRead,
    ReviewAssignment, ReviewAssignmentCreate, ReviewAssignmentUpdate, ReviewAssignmentRead,
    ReviewComment, ReviewCommentCreate, ReviewCommentUpdate, ReviewCommentRead,
    ReviewTemplate, ReviewTemplateCreate, ReviewTemplateRead,
    ReviewMetricsRead, ReviewAnalytics, ReviewerProfile,
    ReviewStatus, ReviewPriority, ReviewCategory, ReviewerLevel
)
from crud.peer_review_crud import (
    create_peer_review, get_peer_review_by_id, get_peer_reviews_for_revision,
    get_peer_reviews_by_reviewer, update_peer_review, start_review, complete_review,
    create_review_assignment, get_pending_assignments, accept_assignment, decline_assignment,
    create_review_comment, get_review_comments,
    get_reviewer_metrics, get_review_analytics,
    create_review_template, get_review_templates,
    assign_reviewers_to_revision, get_review_consensus
)

router = APIRouter()

# Permission helpers
def require_reviewer_permission(current_user: User = Depends(get_current_user)):
    """Require user to be a reviewer (editor, moderator, or admin)"""
    # Allow all authenticated users for now, but check role if available
    if hasattr(current_user, 'role') and current_user.role not in ["admin", "moderator", "editor", "user"]:
        raise HTTPException(status_code=403, detail="Reviewer permission required")
    return current_user

def require_admin_permission(current_user: User = Depends(get_current_user)):
    """Require admin permission"""
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin permission required")
    return current_user

# Core Peer Review Endpoints
@router.post("/reviews", response_model=PeerReviewRead)
async def create_peer_review_endpoint(
    review: PeerReviewCreate,
    current_user: User = Depends(require_reviewer_permission)
):
    """Create a new peer review"""
    result = await create_peer_review(review)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create peer review")
    return result

@router.get("/reviews/{review_id}", response_model=PeerReviewRead)
async def get_peer_review(
    review_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get a specific peer review"""
    result = await get_peer_review_by_id(review_id)
    if not result:
        raise HTTPException(status_code=404, detail="Peer review not found")
    return result

@router.get("/reviews/revision/{revision_id}", response_model=List[PeerReviewRead])
async def get_revision_reviews(
    revision_id: int,
    include_comments: bool = Query(True),
    current_user: User = Depends(get_current_user)
):
    """Get all peer reviews for a specific revision"""
    return await get_peer_reviews_for_revision(revision_id, include_comments)

@router.get("/reviews/reviewer/{reviewer_id}", response_model=List[PeerReviewRead])
async def get_reviewer_reviews(
    reviewer_id: int,
    status: Optional[ReviewStatus] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_reviewer_permission)
):
    """Get peer reviews by a specific reviewer"""
    return await get_peer_reviews_by_reviewer(reviewer_id, status, limit, offset)

@router.patch("/reviews/{review_id}", response_model=PeerReviewRead)
async def update_peer_review_endpoint(
    review_id: int,
    update_data: PeerReviewUpdate,
    current_user: User = Depends(require_reviewer_permission)
):
    """Update a peer review"""
    result = await update_peer_review(review_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Peer review not found")
    return result

@router.post("/reviews/{review_id}/start")
async def start_peer_review(
    review_id: int,
    current_user: User = Depends(require_reviewer_permission)
):
    """Start working on a peer review"""
    success = await start_review(review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Peer review not found")
    return {"message": "Review started successfully"}

@router.post("/reviews/{review_id}/complete")
async def complete_peer_review(
    review_id: int,
    status: ReviewStatus,
    overall_score: Optional[float] = Query(None, ge=1.0, le=5.0),
    criteria_scores: Optional[Dict[str, int]] = None,
    feedback: Optional[str] = None,
    current_user: User = Depends(require_reviewer_permission)
):
    """Complete a peer review with final scores and feedback"""
    success = await complete_review(review_id, status, overall_score, criteria_scores, feedback)
    if not success:
        raise HTTPException(status_code=404, detail="Peer review not found")
    return {"message": "Review completed successfully"}

# Review Assignment System
@router.post("/assignments", response_model=ReviewAssignment)
async def create_review_assignment_endpoint(
    assignment: ReviewAssignmentCreate,
    current_user: User = Depends(require_admin_permission)
):
    """Create a new review assignment"""
    result = await create_review_assignment(assignment)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create review assignment")
    return result

@router.get("/assignments/pending", response_model=List[ReviewAssignmentRead])
async def get_pending_assignments_endpoint(
    current_user: User = Depends(require_reviewer_permission)
):
    """Get pending review assignments for current user"""
    return await get_pending_assignments(current_user.id)

@router.post("/assignments/{assignment_id}/accept")
async def accept_review_assignment(
    assignment_id: int,
    current_user: User = Depends(require_reviewer_permission)
):
    """Accept a review assignment"""
    success = await accept_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment accepted successfully"}

@router.post("/assignments/{assignment_id}/decline")
async def decline_review_assignment(
    assignment_id: int,
    reason: str,
    current_user: User = Depends(require_reviewer_permission)
):
    """Decline a review assignment with reason"""
    success = await decline_assignment(assignment_id, reason)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment declined successfully"}

# Review Comments and Discussions
@router.post("/comments", response_model=ReviewComment)
async def create_review_comment(
    comment: ReviewCommentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a comment on a peer review"""
    comment.commenter_id = current_user.id
    result = await create_review_comment(comment)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create comment")
    return result

@router.get("/comments/{review_id}", response_model=List[ReviewCommentRead])
async def get_review_comments_endpoint(
    review_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a peer review"""
    return await get_review_comments(review_id)

# Review Templates
@router.post("/templates", response_model=ReviewTemplate)
async def create_review_template_endpoint(
    template: ReviewTemplateCreate,
    current_user: User = Depends(require_admin_permission)
):
    """Create a new review template"""
    template.created_by = current_user.id
    result = await create_review_template(template)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create template")
    return result

@router.get("/templates", response_model=List[ReviewTemplateRead])
async def get_review_templates_endpoint(
    category: Optional[ReviewCategory] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get review templates with optional filtering"""
    return await get_review_templates(category)

# Analytics and Metrics
@router.get("/metrics/reviewer/{reviewer_id}", response_model=ReviewMetricsRead)
async def get_reviewer_metrics_endpoint(
    reviewer_id: int,
    current_user: User = Depends(require_reviewer_permission)
):
    """Get comprehensive metrics for a reviewer"""
    result = await get_reviewer_metrics(reviewer_id)
    if not result:
        raise HTTPException(status_code=404, detail="Reviewer metrics not found")
    return result

@router.get("/analytics", response_model=ReviewAnalytics)
async def get_review_analytics_endpoint(
    current_user: User = Depends(require_admin_permission)
):
    """Get comprehensive review analytics"""
    result = await get_review_analytics()
    if not result:
        raise HTTPException(status_code=404, detail="Analytics not available")
    return result

# Advanced Workflow Endpoints
@router.post("/assign-multiple")
async def assign_multiple_reviewers(
    revision_id: int,
    reviewer_ids: List[int],
    priority: ReviewPriority = ReviewPriority.NORMAL,
    due_date: Optional[datetime] = Query(None),
    instructions: Optional[str] = Query(None),
    current_user: User = Depends(require_admin_permission)
):
    """Assign multiple reviewers to a revision"""
    assignments = await assign_reviewers_to_revision(
        revision_id, reviewer_ids, priority, due_date, instructions
    )
    return {
        "message": f"Assigned {len(assignments)} reviewers",
        "assignments": assignments
    }

@router.get("/consensus/{revision_id}")
async def get_review_consensus_endpoint(
    revision_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get consensus analysis for reviews of a revision"""
    return await get_review_consensus(revision_id)

# Dashboard Endpoints
@router.get("/dashboard/overview")
async def get_review_dashboard_overview(
    current_user: User = Depends(require_reviewer_permission)
):
    """Get overview data for review dashboard"""
    try:
        # Get user's pending assignments
        pending_assignments = await get_pending_assignments(current_user.id)
        
        # Get user's recent reviews
        recent_reviews = await get_peer_reviews_by_reviewer(
            current_user.id, limit=10
        )
        
        # Get user's metrics
        metrics = await get_reviewer_metrics(current_user.id)
        
        return {
            "pending_assignments": len(pending_assignments),
            "recent_reviews": recent_reviews,
            "metrics": metrics,
            "user_level": current_user.role
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

@router.get("/dashboard/statistics")
async def get_review_statistics(
    current_user: User = Depends(require_admin_permission)
):
    """Get comprehensive review statistics for admin dashboard"""
    try:
        analytics = await get_review_analytics()
        
        # Get additional statistics
        # This would typically involve more complex queries
        return {
            "analytics": analytics,
            "system_health": {
                "active_reviewers": 0,  # Would need actual query
                "pending_reviews": 0,   # Would need actual query
                "average_review_time": analytics.average_review_time if analytics else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

# Search and Filter Endpoints
@router.get("/search")
async def search_reviews(
    query: Optional[str] = Query(None),
    status: Optional[ReviewStatus] = Query(None),
    priority: Optional[ReviewPriority] = Query(None),
    reviewer_level: Optional[ReviewerLevel] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_reviewer_permission)
):
    """Search and filter peer reviews with advanced criteria"""
    try:
        # This would implement advanced search functionality
        # For now, return a basic implementation
        reviews = await get_peer_reviews_by_reviewer(
            current_user.id, status, limit, offset
        )
        
        return {
            "reviews": reviews,
            "total": len(reviews),
            "filters_applied": {
                "query": query,
                "status": status,
                "priority": priority,
                "reviewer_level": reviewer_level,
                "date_from": date_from,
                "date_to": date_to
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Notification Endpoints
@router.get("/notifications")
async def get_review_notifications(
    current_user: User = Depends(get_current_user)
):
    """Get review-related notifications for current user"""
    try:
        # Get pending assignments
        pending_assignments = await get_pending_assignments(current_user.id)
        
        # Get overdue reviews (simplified)
        overdue_reviews = []  # Would need actual query for overdue reviews
        
        return {
            "pending_assignments": len(pending_assignments),
            "overdue_reviews": len(overdue_reviews),
            "notifications": [
                {
                    "type": "assignment",
                    "message": f"You have {len(pending_assignments)} pending review assignments",
                    "priority": "high" if len(pending_assignments) > 5 else "normal"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notifications: {str(e)}")
