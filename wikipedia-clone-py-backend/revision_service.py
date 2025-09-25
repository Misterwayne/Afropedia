"""
Unified Revision Service - Single Source of Truth for Revision Data
"""
from typing import List, Optional, Dict, Any
from supabase_client import supabase
from models import RevisionRead

class RevisionService:
    """Centralized service for all revision data operations"""
    
    @staticmethod
    async def get_revision_by_id(revision_id: int) -> Optional[Dict[str, Any]]:
        """Get a single revision by ID with consistent data processing"""
        try:
            # Single database query for revision data
            result = supabase.table("revision").select("""
                id, content, comment, timestamp, article_id, user_id, 
                status, is_approved, needs_review, tsvector_content
            """).eq("id", revision_id).execute()
            
            if not result.data:
                return None
            
            revision_data = result.data[0]
            return RevisionService._process_revision_data(revision_data)
            
        except Exception as e:
            print(f"Error getting revision {revision_id}: {e}")
            return None
    
    @staticmethod
    async def get_revisions_by_article_id(article_id: int) -> List[Dict[str, Any]]:
        """Get all revisions for an article with consistent data processing"""
        try:
            # Single database query for all revisions
            result = supabase.table("revision").select("""
                id, content, comment, timestamp, article_id, user_id,
                status, is_approved, needs_review, tsvector_content
            """).eq("article_id", article_id).order("timestamp", desc=True).execute()
            
            if not result.data:
                return []
            
            revisions = []
            for revision_data in result.data:
                processed_revision = RevisionService._process_revision_data(revision_data)
                revisions.append(processed_revision)
            
            return revisions
            
        except Exception as e:
            print(f"Error getting revisions for article {article_id}: {e}")
            return []
    
    @staticmethod
    def _process_revision_data(revision_data: Dict[str, Any]) -> Dict[str, Any]:
        """Centralized data processing for all revision data"""
        # Apply consistent defaults for null values
        status = revision_data.get("status")
        is_approved = revision_data.get("is_approved") 
        needs_review = revision_data.get("needs_review")
        
        # Apply model defaults for null values (matching SQLModel defaults)
        if status is None:
            status = "pending"
        if is_approved is None:
            is_approved = False
        if needs_review is None:
            needs_review = True
            
        
        return {
            "id": revision_data["id"],
            "content": revision_data["content"],
            "comment": revision_data["comment"],
            "timestamp": revision_data["timestamp"],
            "article_id": revision_data["article_id"],
            "user_id": revision_data["user_id"],
            "tsvector_content": revision_data.get("tsvector_content"),
            "status": status,
            "is_approved": is_approved,
            "needs_review": needs_review,
            "user": None,  # Will be populated separately if needed
            "comments": []  # Will be populated separately if needed
        }
