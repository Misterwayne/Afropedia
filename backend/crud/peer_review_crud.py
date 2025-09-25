# crud/peer_review_crud.py - Advanced Peer Review CRUD Operations
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlmodel import select, and_, or_, func, desc, asc
from supabase_client import supabase
from peer_review_models import (
    PeerReview, PeerReviewCreate, PeerReviewUpdate, PeerReviewRead,
    ReviewAssignment, ReviewAssignmentCreate, ReviewAssignmentUpdate, ReviewAssignmentRead,
    ReviewComment, ReviewCommentCreate, ReviewCommentUpdate, ReviewCommentRead,
    ReviewTemplate, ReviewTemplateCreate, ReviewTemplateRead,
    ReviewMetrics, ReviewMetricsRead, ReviewAnalytics, ReviewerProfile,
    ReviewStatus, ReviewPriority, ReviewCategory, ReviewerLevel
)
import json

# Advanced Peer Review CRUD
async def create_peer_review(review: PeerReviewCreate) -> Optional[PeerReview]:
    """Create a new peer review with advanced features"""
    try:
        # Convert criteria_scores to JSON string if provided
        review_data = review.dict()
        if review_data.get('criteria_scores'):
            review_data['criteria_scores'] = json.dumps(review_data['criteria_scores'])
        
        # Calculate overall score from criteria if provided
        if review_data.get('criteria_scores') and not review_data.get('overall_score'):
            criteria = json.loads(review_data['criteria_scores'])
            overall_score = sum(criteria.values()) / len(criteria)
            review_data['overall_score'] = round(overall_score, 2)
        
        result = supabase.table("peer_review").insert(review_data).execute()
        if result.data:
            return PeerReview(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating peer review: {e}")
        return None

async def get_peer_review_by_id(review_id: int) -> Optional[PeerReviewRead]:
    """Get a specific peer review with reviewer details"""
    try:
        result = supabase.table("peer_review").select("""
            *,
            reviewer:user!peer_review_reviewer_id_fkey(username, email)
        """).eq("id", review_id).execute()
        
        if result.data:
            review_data = result.data[0]
            # Parse criteria_scores if it exists
            if review_data.get('criteria_scores'):
                try:
                    review_data['criteria_scores'] = json.loads(review_data['criteria_scores'])
                except:
                    review_data['criteria_scores'] = None
            
            return PeerReviewRead(**review_data)
        return None
    except Exception as e:
        print(f"Error getting peer review: {e}")
        return None

async def get_peer_reviews_for_revision(
    revision_id: int,
    include_comments: bool = True
) -> List[PeerReviewRead]:
    """Get all peer reviews for a specific revision with advanced filtering"""
    try:
        query = supabase.table("peer_review").select("""
            *,
            reviewer:user!peer_review_reviewer_id_fkey(username, email)
        """).eq("revision_id", revision_id)
        
        result = query.order("created_at", desc=True).execute()
        
        reviews = []
        for review_data in result.data or []:
            # Parse criteria_scores if it exists
            if review_data.get('criteria_scores'):
                try:
                    review_data['criteria_scores'] = json.loads(review_data['criteria_scores'])
                except:
                    review_data['criteria_scores'] = None
            
            reviews.append(PeerReviewRead(**review_data))
        
        return reviews
    except Exception as e:
        print(f"Error getting peer reviews for revision: {e}")
        return []

async def get_peer_reviews_by_reviewer(
    reviewer_id: int,
    status: Optional[ReviewStatus] = None,
    limit: int = 50,
    offset: int = 0
) -> List[PeerReviewRead]:
    """Get peer reviews by a specific reviewer with filtering"""
    try:
        # Check if reviewer_id is valid
        if not reviewer_id or reviewer_id <= 0:
            return []
            
        query = supabase.table("peer_review").select("""
            *,
            revision:revision!peer_review_revision_id_fkey(id, content, timestamp),
            article:revision!peer_review_revision_id_fkey(article:article!revision_article_id_fkey(title))
        """).eq("reviewer_id", reviewer_id)
        
        if status:
            query = query.eq("status", status.value)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        reviews = []
        for review_data in result.data or []:
            if review_data.get('criteria_scores'):
                try:
                    review_data['criteria_scores'] = json.loads(review_data['criteria_scores'])
                except:
                    review_data['criteria_scores'] = None
            
            reviews.append(PeerReviewRead(**review_data))
        
        return reviews
    except Exception as e:
        print(f"Error getting peer reviews by reviewer: {e}")
        # If table doesn't exist, return empty list
        if "Could not find the table" in str(e):
            return []
        return []

async def update_peer_review(
    review_id: int, 
    update_data: PeerReviewUpdate
) -> Optional[PeerReviewRead]:
    """Update a peer review with advanced tracking"""
    try:
        update_dict = update_data.dict(exclude_unset=True)
        
        # Convert criteria_scores to JSON if provided
        if update_dict.get('criteria_scores'):
            update_dict['criteria_scores'] = json.dumps(update_dict['criteria_scores'])
        
        # Update version and last_activity
        update_dict['version'] = update_dict.get('version', 1) + 1
        update_dict['last_activity'] = datetime.utcnow().isoformat()
        
        # Set completion time if status is completed
        if update_dict.get('status') in ['approved', 'rejected', 'needs_changes']:
            update_dict['completed_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table("peer_review").update(update_dict).eq("id", review_id).execute()
        
        if result.data:
            review_data = result.data[0]
            if review_data.get('criteria_scores'):
                try:
                    review_data['criteria_scores'] = json.loads(review_data['criteria_scores'])
                except:
                    review_data['criteria_scores'] = None
            
            return PeerReviewRead(**review_data)
        return None
    except Exception as e:
        print(f"Error updating peer review: {e}")
        return None

async def start_review(review_id: int) -> bool:
    """Mark a review as started"""
    try:
        result = supabase.table("peer_review").update({
            "status": "in_progress",
            "started_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }).eq("id", review_id).execute()
        
        return len(result.data or []) > 0
    except Exception as e:
        print(f"Error starting review: {e}")
        return False

async def complete_review(
    review_id: int,
    status: ReviewStatus,
    overall_score: Optional[float] = None,
    criteria_scores: Optional[Dict[str, int]] = None,
    feedback: Optional[str] = None
) -> bool:
    """Complete a peer review with final scores and feedback"""
    try:
        update_data = {
            "status": status.value,
            "completed_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        
        if overall_score:
            update_data["overall_score"] = overall_score
        
        if criteria_scores:
            update_data["criteria_scores"] = json.dumps(criteria_scores)
        
        if feedback:
            update_data["detailed_feedback"] = feedback
        
        result = supabase.table("peer_review").update(update_data).eq("id", review_id).execute()
        
        return len(result.data or []) > 0
    except Exception as e:
        print(f"Error completing review: {e}")
        return False

# Review Assignment System
async def create_review_assignment(assignment: ReviewAssignmentCreate) -> Optional[ReviewAssignment]:
    """Create a new review assignment"""
    try:
        result = supabase.table("review_assignment").insert(assignment.dict()).execute()
        if result.data:
            return ReviewAssignment(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating review assignment: {e}")
        return None

async def get_pending_assignments(user_id: int) -> List[ReviewAssignmentRead]:
    """Get pending review assignments for a user"""
    try:
        # Check if user_id is valid
        if not user_id or user_id <= 0:
            return []
            
        result = supabase.table("review_assignment").select("""
            *,
            assignee:user!review_assignment_assigned_to_fkey(username, email),
            assigner:user!review_assignment_assigned_by_fkey(username, email),
            revision:revision!review_assignment_revision_id_fkey(id, content, timestamp),
            article:revision!review_assignment_revision_id_fkey(article:article!revision_article_id_fkey(title))
        """).eq("assigned_to", user_id).eq("status", "pending").execute()
        
        assignments = []
        for assignment_data in result.data or []:
            assignments.append(ReviewAssignmentRead(**assignment_data))
        
        return assignments
    except Exception as e:
        print(f"Error getting pending assignments: {e}")
        # If table doesn't exist, return empty list
        if "Could not find the table" in str(e):
            return []
        return []

async def accept_assignment(assignment_id: int) -> bool:
    """Accept a review assignment"""
    try:
        result = supabase.table("review_assignment").update({
            "status": "accepted",
            "accepted_at": datetime.utcnow().isoformat()
        }).eq("id", assignment_id).execute()
        
        return len(result.data or []) > 0
    except Exception as e:
        print(f"Error accepting assignment: {e}")
        return False

async def decline_assignment(assignment_id: int, reason: str) -> bool:
    """Decline a review assignment with reason"""
    try:
        result = supabase.table("review_assignment").update({
            "status": "declined",
            "declined_reason": reason
        }).eq("id", assignment_id).execute()
        
        return len(result.data or []) > 0
    except Exception as e:
        print(f"Error declining assignment: {e}")
        return False

# Review Comments and Discussions
async def create_review_comment(comment: ReviewCommentCreate) -> Optional[ReviewComment]:
    """Create a comment on a peer review"""
    try:
        result = supabase.table("review_comment").insert(comment.dict()).execute()
        if result.data:
            return ReviewComment(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating review comment: {e}")
        return None

async def get_review_comments(review_id: int) -> List[ReviewCommentRead]:
    """Get all comments for a peer review"""
    try:
        result = supabase.table("review_comment").select("""
            *,
            commenter:user!review_comment_commenter_id_fkey(username, email)
        """).eq("review_id", review_id).order("created_at", desc=True).execute()
        
        comments = []
        for comment_data in result.data or []:
            comments.append(ReviewCommentRead(**comment_data))
        
        return comments
    except Exception as e:
        print(f"Error getting review comments: {e}")
        return []

# Review Analytics and Metrics
async def get_reviewer_metrics(reviewer_id: int) -> Optional[ReviewMetricsRead]:
    """Get comprehensive metrics for a reviewer"""
    try:
        # Check if reviewer_id is valid
        if not reviewer_id or reviewer_id <= 0:
            return None
            
        # Get basic review data
        reviews_result = supabase.table("peer_review").select("*").eq("reviewer_id", reviewer_id).execute()
        reviews = reviews_result.data or []
        
        if not reviews:
            # Return empty metrics for new reviewers
            return ReviewMetricsRead(
                reviewer_id=reviewer_id,
                total_reviews=0,
                average_score=0.0,
                completion_rate=0.0,
                average_time_minutes=0.0,
                accuracy_score=0.0,
                helpfulness_score=0.0,
                last_review_date=None,
                reviewer_name="Unknown",
                reviewer_level="user"
            )
        
        # Calculate metrics
        total_reviews = len(reviews)
        completed_reviews = len([r for r in reviews if r.get('status') in ['approved', 'rejected', 'needs_changes']])
        completion_rate = (completed_reviews / total_reviews) * 100 if total_reviews > 0 else 0
        
        # Calculate average score
        scores = [r.get('overall_score') for r in reviews if r.get('overall_score')]
        average_score = sum(scores) / len(scores) if scores else 0.0
        
        # Calculate average time
        times = [r.get('time_spent_minutes') for r in reviews if r.get('time_spent_minutes')]
        average_time = sum(times) / len(times) if times else 0.0
        
        # Get reviewer info
        user_result = supabase.table("user").select("username, role").eq("id", reviewer_id).execute()
        reviewer_name = user_result.data[0].get('username') if user_result.data else None
        reviewer_level = user_result.data[0].get('role') if user_result.data else None
        
        return ReviewMetricsRead(
            reviewer_id=reviewer_id,
            total_reviews=total_reviews,
            average_score=average_score,
            completion_rate=completion_rate,
            average_time_minutes=average_time,
            accuracy_score=0.0,  # Would need more complex calculation
            helpfulness_score=0.0,  # Would need feedback system
            last_review_date=reviews[0].get('created_at') if reviews else None,
            reviewer_name=reviewer_name,
            reviewer_level=reviewer_level
        )
    except Exception as e:
        print(f"Error getting reviewer metrics: {e}")
        return None

async def get_review_analytics() -> Optional[ReviewAnalytics]:
    """Get comprehensive review analytics"""
    try:
        # Get all reviews
        reviews_result = supabase.table("peer_review").select("*").execute()
        reviews = reviews_result.data or []
        
        if not reviews:
            return None
        
        # Calculate basic metrics
        total_reviews = len(reviews)
        completed_reviews = len([r for r in reviews if r.get('status') in ['approved', 'rejected', 'needs_changes']])
        completion_rate = (completed_reviews / total_reviews) * 100 if total_reviews > 0 else 0
        
        # Calculate average score
        scores = [r.get('overall_score') for r in reviews if r.get('overall_score')]
        average_score = sum(scores) / len(scores) if scores else 0.0
        
        # Calculate average time
        times = [r.get('time_spent_minutes') for r in reviews if r.get('time_spent_minutes')]
        average_review_time = sum(times) / len(times) if times else 0.0
        
        # Get top reviewers (simplified)
        reviewer_counts = {}
        for review in reviews:
            reviewer_id = review.get('reviewer_id')
            if reviewer_id:
                reviewer_counts[reviewer_id] = reviewer_counts.get(reviewer_id, 0) + 1
        
        top_reviewers = [
            {"reviewer_id": rid, "review_count": count}
            for rid, count in sorted(reviewer_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        return ReviewAnalytics(
            total_reviews=total_reviews,
            average_score=average_score,
            completion_rate=completion_rate,
            average_review_time=average_review_time,
            top_reviewers=top_reviewers,
            review_trends=[],  # Would need time-series analysis
            quality_metrics={}  # Would need more complex calculations
        )
    except Exception as e:
        print(f"Error getting review analytics: {e}")
        return None

# Review Templates
async def create_review_template(template: ReviewTemplateCreate) -> Optional[ReviewTemplate]:
    """Create a new review template"""
    try:
        template_data = template.dict()
        if template_data.get('criteria'):
            template_data['criteria'] = json.dumps(template_data['criteria'])
        
        result = supabase.table("review_template").insert(template_data).execute()
        if result.data:
            return ReviewTemplate(**result.data[0])
        return None
    except Exception as e:
        print(f"Error creating review template: {e}")
        return None

async def get_review_templates(category: Optional[ReviewCategory] = None) -> List[ReviewTemplateRead]:
    """Get review templates with optional filtering"""
    try:
        query = supabase.table("review_template").select("""
            *,
            creator:user!review_template_created_by_fkey(username, email)
        """)
        
        if category:
            query = query.eq("category", category.value)
        
        result = query.order("usage_count", desc=True).execute()
        
        templates = []
        for template_data in result.data or []:
            if template_data.get('criteria'):
                try:
                    template_data['criteria'] = json.loads(template_data['criteria'])
                except:
                    template_data['criteria'] = {}
            
            templates.append(ReviewTemplateRead(**template_data))
        
        return templates
    except Exception as e:
        print(f"Error getting review templates: {e}")
        return []

# Advanced Review Workflow
async def assign_reviewers_to_revision(
    revision_id: int,
    reviewer_ids: List[int],
    priority: ReviewPriority = ReviewPriority.NORMAL,
    due_date: Optional[datetime] = None,
    instructions: Optional[str] = None
) -> List[ReviewAssignment]:
    """Assign multiple reviewers to a revision"""
    try:
        assignments = []
        for reviewer_id in reviewer_ids:
            assignment = ReviewAssignmentCreate(
                revision_id=revision_id,
                assigned_to=reviewer_id,
                assigned_by=1,  # System user
                priority=priority,
                due_date=due_date,
                instructions=instructions
            )
            
            result = await create_review_assignment(assignment)
            if result:
                assignments.append(result)
        
        return assignments
    except Exception as e:
        print(f"Error assigning reviewers: {e}")
        return []

async def get_review_consensus(revision_id: int) -> Dict[str, Any]:
    """Get consensus analysis for reviews of a revision"""
    try:
        reviews = await get_peer_reviews_for_revision(revision_id)
        
        if not reviews:
            return {"consensus": "no_reviews", "confidence": 0.0}
        
        # Analyze scores
        scores = [r.overall_score for r in reviews if r.overall_score]
        if not scores:
            return {"consensus": "no_scores", "confidence": 0.0}
        
        avg_score = sum(scores) / len(scores)
        score_variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
        confidence = max(0, 1 - (score_variance / 4))  # Normalize to 0-1
        
        # Determine consensus
        if confidence > 0.8:
            consensus = "high_agreement"
        elif confidence > 0.6:
            consensus = "moderate_agreement"
        else:
            consensus = "low_agreement"
        
        return {
            "consensus": consensus,
            "confidence": confidence,
            "average_score": avg_score,
            "score_variance": score_variance,
            "review_count": len(reviews)
        }
    except Exception as e:
        print(f"Error getting review consensus: {e}")
        return {"consensus": "error", "confidence": 0.0}
