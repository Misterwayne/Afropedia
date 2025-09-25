from supabase import create_client
from config import settings

# Initialize Supabase client
supabase = create_client(settings.supabase_url, settings.supabase_key)

# For backward compatibility with existing code
async def get_session():
    """
    This is a dummy session getter to maintain compatibility with existing code.
    In a Supabase implementation, we don't need database sessions in the same way.
    """
    class DummySession:
        def __init__(self):
            self._objects = []
            self._deleted_objects = []
            
        async def __aenter__(self):
            return self
        
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
            
        async def execute(self, statement, params=None):
            """Dummy execute method that returns empty results"""
            class DummyResult:
                def scalars(self):
                    return self
                def all(self):
                    return []
                def one(self):
                    return None
                def one_or_none(self):
                    return None
                def scalar_one_or_none(self):
                    return None
                def first(self):
                    return None
            return DummyResult()
            
        def add(self, instance):
            """Dummy add method"""
            self._objects.append(instance)
            
        async def delete(self, instance):
            """Dummy delete method"""
            self._deleted_objects.append(instance)
            
        async def commit(self):
            """Dummy commit method"""
            pass
            
        async def rollback(self):
            """Dummy rollback method"""
            self._objects.clear()
            self._deleted_objects.clear()
            
        async def refresh(self, instance, attribute_names=None):
            """Dummy refresh method"""
            pass
            
        async def flush(self):
            """Dummy flush method"""
            pass
            
    return DummySession()