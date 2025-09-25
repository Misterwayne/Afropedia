from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from pydantic import BaseModel

router = APIRouter()

class TestQuery(BaseModel):
    table_name: str

@router.post("/test-query")
async def test_supabase_connection(query: TestQuery):
    try:
        # Test a simple query to the specified table
        response = supabase.table(query.table_name).select("*").limit(5).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
