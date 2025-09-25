# peer_review_models.py - Advanced Peer Review System Models
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import json

# Advanced Enums for Peer Review System
class ReviewStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_CHANGES = "needs_changes"
    CONFLICT = "conflict"  # When reviewers disagree
    ESCALATED = "escalated"  # When escalated to senior reviewers

class ReviewPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class ReviewCategory(str, Enum):
    ACCURACY = "accuracy"
    CLARITY = "clarity"
    COMPLETENESS = "completeness"
    SOURCES = "sources"
    NEUTRALITY = "neutrality"
    STYLE = "style"
    TECHNICAL = "technical"
    FACTUAL = "factual"

class ReviewerLevel(str, Enum):
    JUNIOR = "junior"
    SENIOR = "senior"
    EXPERT = "expert"
    MENTOR = "mentor"

# Advanced Review Criteria
class ReviewCriteria(SQLModel):
    accuracy: int = Field(ge=1, le=5, description="Factual accuracy and correctness")
    clarity: int = Field(ge=1, le=5, description="Clarity and readability")
    completeness: int = Field(ge=1, le=5, description="Completeness of information")
    sources: int = Field(ge=1, le=5, description="Quality and reliability of sources")
    neutrality: int = Field(ge=1, le=5, description="Neutral point of view")
    style: int = Field(ge=1, le=5, description="Writing style and structure")
    technical: int = Field(ge=1, le=5, description="Technical accuracy")
    factual: int = Field(ge=1, le=5, description="Factual verification")

# Advanced Peer Review Model
class PeerReviewBase(SQLModel):
    revision_id: int = Field(foreign_key="revision.id")
    reviewer_id: int = Field(foreign_key="user.id")
    status: ReviewStatus
    priority: ReviewPriority = Field(default=ReviewPriority.NORMAL)
    reviewer_level: ReviewerLevel = Field(default=ReviewerLevel.JUNIOR)
    
    # Advanced scoring system
    overall_score: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    criteria_scores: Optional[str] = Field(default=None)  # JSON string of ReviewCriteria
    
    # Detailed feedback
    summary: Optional[str] = Field(default=None, max_length=500)
    strengths: Optional[str] = Field(default=None, max_length=1000)
    weaknesses: Optional[str] = Field(default=None, max_length=1000)
    suggestions: Optional[str] = Field(default=None, max_length=1000)
    detailed_feedback: Optional[str] = Field(default=None, max_length=5000)
    
    # Review metadata
    time_spent_minutes: Optional[int] = Field(default=None, ge=0)
    confidence_level: Optional[int] = Field(default=None, ge=1, le=5)
    is_anonymous: bool = Field(default=False)
    
    # Conflict resolution
    conflict_reason: Optional[str] = Field(default=None, max_length=500)
    escalated_to: Optional[int] = Field(default=None, foreign_key="user.id")
    escalation_reason: Optional[str] = Field(default=None, max_length=500)

class PeerReview(PeerReviewBase, table=True):
    __tablename__ = "peer_review"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    
    # Review tracking
    last_activity: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    version: int = Field(default=1)  # For tracking review revisions

# Review Assignment System
class ReviewAssignmentBase(SQLModel):
    revision_id: int = Field(foreign_key="revision.id")
    assigned_to: int = Field(foreign_key="user.id")
    assigned_by: int = Field(foreign_key="user.id")
    priority: ReviewPriority = Field(default=ReviewPriority.NORMAL)
    due_date: Optional[datetime] = Field(default=None)
    instructions: Optional[str] = Field(default=None, max_length=1000)
    required_level: ReviewerLevel = Field(default=ReviewerLevel.JUNIOR)

class ReviewAssignment(ReviewAssignmentBase, table=True):
    __tablename__ = "review_assignment"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="pending")  # pending, accepted, declined, completed
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    accepted_at: Optional[datetime] = Field(default=None)
    declined_reason: Optional[str] = Field(default=None, max_length=500)

# Review Analytics and Metrics
class ReviewMetrics(SQLModel):
    reviewer_id: int
    total_reviews: int = 0
    average_score: float = 0.0
    completion_rate: float = 0.0
    average_time_minutes: float = 0.0
    accuracy_score: float = 0.0
    helpfulness_score: float = 0.0
    last_review_date: Optional[datetime] = None

# Review Comments and Discussions
class ReviewCommentBase(SQLModel):
    review_id: int = Field(foreign_key="peer_review.id")
    commenter_id: int = Field(foreign_key="user.id")
    content: str = Field(max_length=2000)
    is_internal: bool = Field(default=True)  # Internal discussion vs public comment
    parent_comment_id: Optional[int] = Field(default=None, foreign_key="review_comment.id")

class ReviewComment(ReviewCommentBase, table=True):
    __tablename__ = "review_comment"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    is_resolved: bool = Field(default=False)

# Review Templates
class ReviewTemplateBase(SQLModel):
    name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    category: ReviewCategory
    criteria: str = Field(default="{}")  # JSON string of criteria weights
    instructions: str = Field(max_length=2000)
    is_default: bool = Field(default=False)
    created_by: int = Field(foreign_key="user.id")

class ReviewTemplate(ReviewTemplateBase, table=True):
    __tablename__ = "review_template"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    usage_count: int = Field(default=0)

# Read Models for API responses
class PeerReviewRead(PeerReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    last_activity: datetime
    version: int
    reviewer_name: Optional[str] = None
    reviewer_avatar: Optional[str] = None

class ReviewAssignmentRead(ReviewAssignmentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    accepted_at: Optional[datetime]
    declined_reason: Optional[str]
    assignee_name: Optional[str] = None
    assigner_name: Optional[str] = None

class ReviewMetricsRead(ReviewMetrics):
    reviewer_name: Optional[str] = None
    reviewer_level: Optional[str] = None

class ReviewCommentRead(ReviewCommentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_resolved: bool
    commenter_name: Optional[str] = None

class ReviewTemplateRead(ReviewTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    usage_count: int
    creator_name: Optional[str] = None

# Create Models for API requests
class PeerReviewCreate(PeerReviewBase):
    criteria_scores: Optional[Dict[str, int]] = None

class ReviewAssignmentCreate(ReviewAssignmentBase):
    pass

class ReviewCommentCreate(ReviewCommentBase):
    pass

class ReviewTemplateCreate(ReviewTemplateBase):
    criteria: Optional[Dict[str, float]] = None

# Update Models
class PeerReviewUpdate(SQLModel):
    status: Optional[ReviewStatus] = None
    overall_score: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    criteria_scores: Optional[Dict[str, int]] = None
    summary: Optional[str] = Field(default=None, max_length=500)
    strengths: Optional[str] = Field(default=None, max_length=1000)
    weaknesses: Optional[str] = Field(default=None, max_length=1000)
    suggestions: Optional[str] = Field(default=None, max_length=1000)
    detailed_feedback: Optional[str] = Field(default=None, max_length=5000)
    time_spent_minutes: Optional[int] = Field(default=None, ge=0)
    confidence_level: Optional[int] = Field(default=None, ge=1, le=5)
    is_anonymous: Optional[bool] = None

class ReviewAssignmentUpdate(SQLModel):
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    instructions: Optional[str] = Field(default=None, max_length=1000)
    declined_reason: Optional[str] = Field(default=None, max_length=500)

class ReviewCommentUpdate(SQLModel):
    content: Optional[str] = Field(default=None, max_length=2000)
    is_resolved: Optional[bool] = None

# Advanced Analytics Models
class ReviewAnalytics(SQLModel):
    total_reviews: int
    average_score: float
    completion_rate: float
    average_review_time: float
    top_reviewers: List[Dict[str, Any]]
    review_trends: List[Dict[str, Any]]
    quality_metrics: Dict[str, float]

class ReviewerProfile(SQLModel):
    reviewer_id: int
    name: str
    level: str
    total_reviews: int
    average_score: float
    completion_rate: float
    specialties: List[str]
    recent_activity: List[Dict[str, Any]]
