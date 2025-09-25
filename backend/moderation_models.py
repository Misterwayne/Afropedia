# moderation_models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums for better type safety
class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    EDITOR = "editor"
    USER = "user"

class ContentStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FEATURED = "featured"

class ModerationStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class ReviewStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_CHANGES = "needs_changes"

class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class ActionType(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    FLAG = "flag"
    UNFLAG = "unflag"
    FEATURE = "feature"
    UNFEATURE = "unfeature"

class FlagType(str, Enum):
    INAPPROPRIATE = "inappropriate"
    SPAM = "spam"
    INACCURATE = "inaccurate"
    COPYRIGHT = "copyright"
    OTHER = "other"

# Base models
class ModerationQueueBase(SQLModel):
    content_type: str = Field(index=True)
    content_id: int = Field(index=True)
    submitted_by: int = Field(foreign_key="user.id")
    priority: Priority = Field(default=Priority.NORMAL)
    status: ModerationStatus = Field(default=ModerationStatus.PENDING)

class ModerationQueue(ModerationQueueBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    submitted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    assigned_to: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class PeerReviewBase(SQLModel):
    revision_id: int = Field(foreign_key="revision.id")
    reviewer_id: int = Field(foreign_key="user.id")
    status: ReviewStatus
    score: Optional[int] = Field(default=None, ge=1, le=5)
    feedback: Optional[str] = Field(default=None)

class PeerReview(PeerReviewBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class ModerationActionBase(SQLModel):
    moderator_id: int = Field(foreign_key="user.id")
    content_type: str = Field(index=True)
    content_id: int = Field(index=True)
    action_type: ActionType
    reason: Optional[str] = Field(default=None)

class ModerationAction(ModerationActionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class ContentFlagBase(SQLModel):
    content_type: str = Field(index=True)
    content_id: int = Field(index=True)
    flagger_id: int = Field(foreign_key="user.id")
    flag_type: FlagType
    reason: Optional[str] = Field(default=None)
    status: str = Field(default="pending")

class ContentFlag(ContentFlagBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resolved_by: Optional[int] = Field(default=None, foreign_key="user.id")
    resolved_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class UserPermissionBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    permission: str = Field(index=True)
    granted_by: Optional[int] = Field(default=None, foreign_key="user.id")
    expires_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)

class UserPermission(UserPermissionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    granted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

# Read models for API responses
class ModerationQueueRead(ModerationQueueBase):
    id: int
    submitted_at: datetime
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: datetime

class PeerReviewRead(PeerReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ModerationActionRead(ModerationActionBase):
    id: int
    created_at: datetime

class ContentFlagRead(ContentFlagBase):
    id: int
    resolved_by: Optional[int]
    resolved_at: Optional[datetime]
    created_at: datetime

class UserPermissionRead(UserPermissionBase):
    id: int
    granted_at: datetime

# Create models for API requests
class ModerationQueueCreate(ModerationQueueBase):
    pass

class PeerReviewCreate(PeerReviewBase):
    pass

class ModerationActionCreate(ModerationActionBase):
    pass

class ContentFlagCreate(ContentFlagBase):
    pass

class UserPermissionCreate(UserPermissionBase):
    pass

# Update models
class ModerationQueueUpdate(SQLModel):
    assigned_to: Optional[int] = None
    status: Optional[ModerationStatus] = None
    priority: Optional[Priority] = None

class PeerReviewUpdate(SQLModel):
    status: Optional[ReviewStatus] = None
    score: Optional[int] = Field(default=None, ge=1, le=5)
    feedback: Optional[str] = None

class ContentFlagUpdate(SQLModel):
    status: Optional[str] = None
    resolved_by: Optional[int] = None
    resolved_at: Optional[datetime] = None

class UserPermissionUpdate(SQLModel):
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None

# Request models for moderation actions
class ApproveContentRequest(SQLModel):
    content_type: str
    content_id: int
    reason: Optional[str] = None

class RejectContentRequest(SQLModel):
    content_type: str
    content_id: int
    reason: Optional[str] = None
