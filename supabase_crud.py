
# Image operations
async def create_image_content_supabase(binary_data: bytes) -> Optional[dict]:
    """Create image content in Supabase"""
    try:
        # Convert binary data to base64 for Supabase storage
        import base64
        binary_data_b64 = base64.b64encode(binary_data).decode('utf-8')
        
        result = supabase.table("image_content").insert({
            "binary_data": binary_data_b64
        }).execute()
        
        if result.data:
            print(f"[CRUD Image] Created ImageContent with ID: {result.data[0]['id']}")
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating image content: {e}")
        return None

async def create_image_metadata_supabase(
    content_id: int,
    original_filename: str,
    content_type: str,
    size_bytes: int
) -> Optional[dict]:
    """Create image metadata in Supabase"""
    try:
        result = supabase.table("image_metadata").insert({
            "original_filename": original_filename,
            "content_type": content_type,
            "content_id": content_id,
            "size_bytes": size_bytes,
            "uploaded_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            print(f"[CRUD Image] Successfully created ImageMetadata ID: {result.data[0]['id']}")
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error creating image metadata: {e}")
        return None
