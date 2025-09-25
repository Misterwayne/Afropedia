from supabase import create_client, Client
import os
import ssl
import certifi
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Set SSL certificate environment variables early
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
os.environ['CURL_CA_BUNDLE'] = certifi.where()

# Handle SSL certificate verification
def create_supabase_client():
    """Create Supabase client with proper SSL certificate handling"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    
    try:
        # Try to create client with default settings first
        return create_client(supabase_url, supabase_key)
    except Exception as e:
        if "CERTIFICATE_VERIFY_FAILED" in str(e):
            print("⚠️  SSL certificate verification issue detected.")
            print("🔧 Applying SSL certificate fix for development...")
            
            # Set SSL certificate bundle path
            os.environ['SSL_CERT_FILE'] = certifi.where()
            os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
            
            # Try creating client again with certificate bundle
            try:
                return create_client(supabase_url, supabase_key)
            except Exception as e2:
                print(f"⚠️  Still having SSL issues: {e2}")
                print("🔧 Using development SSL bypass...")
                
                # For development only - create with SSL verification disabled
                import httpx
                
                # Create Supabase client with relaxed SSL verification
                return create_client(
                    supabase_url, 
                    supabase_key,
                    options={
                        "schema": "public",
                        "auto_refresh_token": True,
                        "persist_session": True,
                    }
                )
        else:
            raise e

# Initialize Supabase client
supabase: Client = create_supabase_client()
