# models.py
from typing import List, Optional
from pydantic import validator
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column
import uuid
# Import specific SQLAlchemy types for unsupported fields
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

class UserLogin(SQLModel): # Or BaseModel
    loginIdentifier: str # Matches the frontend field name
    password: str

# --- User Model ---
class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field() # Store hashed password
    role: str = Field(default="user", index=True) # User role for moderation
    is_active: bool = Field(default=True) # Account status
    reputation_score: int = Field(default=0) # User reputation for moderation
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow}, nullable=False)
    revisions: List["Revision"] = Relationship(back_populates="user") # Relationship defined later
    comments: List["Comment"] = Relationship(back_populates="user")  # Add this line
    sources: List["Source"] = Relationship(back_populates="creator")
    references: List["Reference"] = Relationship(back_populates="creator")

class UserCreate(UserBase):
    password: str # Plain password for registration

class UserRead(UserBase):
    id: int
    role: str = Field(default="user")
    is_active: bool = Field(default=True)
    reputation_score: int = Field(default=0)
    created_at: datetime
    updated_at: datetime

class ArticleBase(SQLModel):
    title: str = Field(index=True, unique=True)

class Article(ArticleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="draft", index=True) # Content status for moderation
    is_featured: bool = Field(default=False) # Featured content flag
    view_count: int = Field(default=0) # View tracking
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow}, nullable=False)
    current_revision_id: Optional[int] = Field(
        default=None,
        foreign_key="revision.id", # Points to Revision table's PK
        unique=True,
        nullable=True
    )

    # FIX: Define the 'revisions' relationship (one article has many revisions)
    # Specify that this relationship uses the 'Revision.article_id' foreign key
    revisions: List["Revision"] = Relationship(
        back_populates="article",
        sa_relationship_kwargs={
            "foreign_keys": "[Revision.article_id]" # Explicitly use the FK in Revision table
        }
    )

    # FIX: Define the 'currentRevision' relationship (one article points to one revision)
    # Specify that this relationship uses the 'Article.current_revision_id' foreign key
    currentRevision: Optional["Revision"] = Relationship(
        back_populates="is_current_in",
        sa_relationship_kwargs={
            "foreign_keys": "[Article.current_revision_id]", # Use the FK in THIS (Article) table
            "lazy": "selectin", # Optional: Load this eagerly
            "uselist": False # Important: Indicates this is one-to-one (or many-to-one)
        }
    )

    # References relationship (one article has many references)
    references: List["Reference"] = Relationship(
        back_populates="article",
        sa_relationship_kwargs={
            "foreign_keys": "[Reference.article_id]"
        }
    )

class CommentBase(SQLModel):
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    revision_id: int = Field(foreign_key="revision.id")

class Comment(CommentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    revision: "Revision" = Relationship(back_populates="comments")
    user: Optional["User"] = Relationship(back_populates="comments")

class CommentRead(SQLModel):
    id: int
    content: str
    created_at: datetime
    user_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass


class RevisionBase(SQLModel):
    content: str = Field(sa_column=sa.Column(sa.TEXT))
    comment: Optional[str] = Field(default=[])
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    article_id: Optional[int] = Field(default=None, foreign_key="article.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=True)
    tsvector_content: Optional[str] = Field(
        default=None,
        sa_column=sa.Column(postgresql.TSVECTOR, nullable=True)
    )

class Revision(RevisionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="pending", index=True) # Moderation status
    is_approved: bool = Field(default=False) # Approval status
    needs_review: bool = Field(default=True) # Review requirement flag
    comments: List[Comment] = Relationship(back_populates="revision")

    article: "Article" = Relationship(
        back_populates="revisions",
        sa_relationship_kwargs={
            "foreign_keys": "[Revision.article_id]" # Use the FK in THIS (Revision) table
        }
    )

    user: Optional[User] = Relationship(back_populates="revisions")

    is_current_in: Optional["Article"] = Relationship(
        back_populates="currentRevision",
        sa_relationship_kwargs={
            "foreign_keys": "[Article.current_revision_id]", 
            "uselist": False 
        }
    )


# --- Read/Create/Update Models (remain mostly the same) ---
class RevisionRead(RevisionBase):
    id: int
    status: str = "pending"  # Moderation status - default to pending
    is_approved: bool = False  # Approval status - default to False
    needs_review: bool = True  # Review requirement flag - default to True
    user: Optional[UserRead] = None
    comments: List[CommentRead] = Field(default_factory=list)
    
    @validator('status', pre=True)
    def validate_status(cls, v):
        # Don't apply defaults - use actual database values
        return v
    
    @validator('is_approved', pre=True)
    def validate_is_approved(cls, v):
        # Don't apply defaults - use actual database values  
        return v
    
    @validator('needs_review', pre=True)  
    def validate_needs_review(cls, v):
        # Don't apply defaults - use actual database values
        return v

class RevisionReadWithUser(RevisionRead):
    user: Optional[UserRead] = None
    comments: List[CommentRead] = Field(default_factory=list)  # Changed from [] to default_factory

class ArticleCreate(ArticleBase):
    content: str
    comment: Optional[str] = None
    comments: Optional[List[str]] = Field(
        default_factory=list,
        sa_column=sa.Column(postgresql.ARRAY(sa.String))
    )

class ArticleUpdate(SQLModel):
    content: str
    comment: Optional[str] = None
    commenst: Optional[List[str]] = Field(
        default_factory=list,
        sa_column=sa.Column(postgresql.ARRAY(sa.String))
    )

class ArticleRead(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ArticleReadWithCurrentRevision(ArticleRead):
    currentRevision: Optional[RevisionReadWithUser] = None



# Link table for content/metadata (One-to-One)
class MusicContent(SQLModel, table=True):
    __tablename__ = 'music_content' # Keep original name if desired
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    # Use LargeBinary from SQLAlchemy via sa_column
    binary_data: Optional[bytes] = Field(default=None, sa_column=sa.Column(sa.LargeBinary))

    # Define the one-to-one relationship back to metadata
    music_metadata: Optional["MusicMetadata"] = Relationship(back_populates="music_content")

class MusicMetadataBase(SQLModel):
    title: str = Field(index=True)
    artist: str = Field(index=True)
    album: str = Field(index=True)
    # Foreign Key
    content_id: Optional[int] = Field(default=None, foreign_key="music_content.id")
    # Store cover as bytes - consider object storage for large files
    cover_image: Optional[bytes] = Field(default=None, sa_column=sa.Column(sa.LargeBinary, nullable=True))


class MusicMetadata(MusicMetadataBase, table=True):
    __tablename__ = 'music_metadata' # Keep original name if desired
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    # Define the one-to-one relationship to content
    music_content: Optional[MusicContent] = Relationship(back_populates="music_metadata")

# --- NEW Pydantic Schemas for Music ---
# We can use SQLModel itself for schemas, or Pydantic BaseModel
class MusicMetadataSchema(SQLModel): # Inherit from SQLModel for consistency
    id: int
    title: str
    artist: str
    album: str

    model_config = { # Replaces Config class for Pydantic v2+
        "from_attributes": True # Enable ORM mode
    }

class MusicMetadataCreate(SQLModel): # Schema for creation
    title: str
    artist: str
    album: str


# === NEW Video Models ===

# Link table for content/metadata (One-to-One)
class VideoContent(SQLModel, table=True):
    __tablename__ = 'video_content' # Keep original name
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    binary_data: Optional[bytes] = Field(default=None, sa_column=sa.Column(sa.LargeBinary))

    video_metadata: Optional["VideoMetadata"] = Relationship(back_populates="content")


class VideoMetadataBase(SQLModel):
    filename: str = Field(index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    # Foreign Key
    content_id: Optional[int] = Field(default=None, foreign_key="video_content.id")
    # Add user association if desired (e.g., who uploaded)
    # user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[str] = Field(default="anonymous", index=True) # Keeping simple string user for now like original


class VideoMetadata(VideoMetadataBase, table=True):
    __tablename__ = 'videos' # Keep original name
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    # Relationship to content
    content: Optional[VideoContent] = Relationship(back_populates="video_metadata")
    # Optional: Link to User model if you added user_id
    # user_uploader: Optional["User"] = Relationship()


# --- NEW Pydantic Schemas for Video ---
class VideoMetadataSchema(SQLModel): # Use SQLModel for consistency
    id: int
    filename: str
    timestamp: datetime
    user: Optional[str] = None # Include user if relevant

    model_config = {
        "from_attributes": True
    }

class VideoMetadataCreate(SQLModel): # Schema for creation
    filename: str
    timestamp: datetime

class ImageContent(SQLModel, table=True):
    __tablename__ = 'image_content' # New table name
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    binary_data: Optional[bytes] = Field(default=None, sa_column=sa.Column(sa.LargeBinary))

    # Relationship back to metadata (one-to-one)
    image_metadata: Optional["ImageMetadata"] = Relationship(back_populates="content")

# Table to store image metadata
class ImageMetadataBase(SQLModel):
    original_filename: Optional[str] = Field(default=None)
    content_type: Optional[str] = Field(default=None)
    content_id: Optional[int] = Field(default=None, foreign_key="image_content.id")
    size_bytes: Optional[int] = Field(default=None)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    # Foreign Key linking to the content table
    # Optional: Link to user
    # uploaded_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")

class ImageMetadata(ImageMetadataBase, table=True):
    __tablename__ = "image_metadata"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    # Relationship to the content table (one-to-one)
    content: Optional["ImageContent"] = Relationship(back_populates="image_metadata")

    # Optional: Relationship to user
    # uploader: Optional["User"] = Relationship()


# --- REVISED Schemas for Image ---
class ImageMetadataRead(SQLModel): # Schema for listing/reading metadata
    id: int
    original_filename: Optional[str]
    content_type: Optional[str]
    size_bytes: Optional[int]
    uploaded_at: datetime
    # No binary_data or content_id needed here usually

    model_config = { "from_attributes": True }

# Input schema doesn't need content_id or binary_data
class ImageMetadataCreate(SQLModel):
     original_filename: Optional[str] = None
     content_type: Optional[str] = None
     size_bytes: Optional[int] = None
     # Add other metadata fields if needed

# Response for upload, indicating success and metadata ID
class ImageUploadResponse(SQLModel):
    id: int # Metadata ID
    filename: Optional[str]
    content_type: Optional[str]
    size_bytes: Optional[int]
    # We'll use a separate stream URL, so no URL needed here
    message: str = "Image uploaded successfully"

class BookBase(SQLModel):
    title: str = Field(index=True)
    author: str = Field(index=True)
    published_date: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    isbn: Optional[str] = Field(default=None, index=True)
    genre: Optional[str] = Field(default=None, index=True)
    summary: Optional[str] = Field(default=None)
    cover_image: Optional[str] = Field(default=None, nullable=True)

class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow}, nullable=False)
    # Add any additional relationships if needed

class BookCreate(BookBase):
    pass

class BookRead(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = { "from_attributes": True }

class BookUpdate(SQLModel):
    title: Optional[str] = None
    author: Optional[str] = None
    published_date: Optional[datetime] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    genre: Optional[str] = None
    summary: Optional[str] = None
    cover_image: Optional[str] = None

# --- Source and Reference Models ---
class SourceBase(SQLModel):
    title: str = Field(index=True)
    url: Optional[str] = None
    author: Optional[str] = None
    publication: Optional[str] = None
    publication_date: Optional[datetime] = None
    access_date: Optional[datetime] = None
    source_type: str = Field(default="web", index=True)  # web, book, journal, newspaper, etc.
    isbn: Optional[str] = None
    doi: Optional[str] = None
    description: Optional[str] = None

class Source(SourceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # Relationships
    references: List["Reference"] = Relationship(back_populates="source")
    creator: Optional["User"] = Relationship(back_populates="sources")

class SourceRead(SourceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

class SourceCreate(SourceBase):
    pass

class SourceUpdate(SQLModel):
    title: Optional[str] = None
    url: Optional[str] = None
    author: Optional[str] = None
    publication: Optional[str] = None
    publication_date: Optional[datetime] = None
    access_date: Optional[datetime] = None
    source_type: Optional[str] = None
    isbn: Optional[str] = None
    doi: Optional[str] = None
    description: Optional[str] = None

class ReferenceBase(SQLModel):
    article_id: int = Field(foreign_key="article.id")
    source_id: int = Field(foreign_key="source.id")
    reference_number: int = Field(index=True)  # The number that appears in the article text
    context: Optional[str] = None  # The text around the reference
    page_number: Optional[str] = None  # For book sources
    section: Optional[str] = None  # For book/journal sources

class Reference(ReferenceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # Relationships
    article: "Article" = Relationship(back_populates="references")
    source: "Source" = Relationship(back_populates="references")
    creator: Optional["User"] = Relationship(back_populates="references")

class ReferenceRead(ReferenceBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
    source: SourceRead

class ReferenceCreate(ReferenceBase):
    pass

class ReferenceUpdate(SQLModel):
    source_id: Optional[int] = None
    reference_number: Optional[int] = None
    context: Optional[str] = None
    page_number: Optional[str] = None
    section: Optional[str] = None