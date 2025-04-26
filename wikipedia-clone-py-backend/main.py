# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
# Import routers (we will create these)
from routers import articles, auth, search, music, video, images, books
# from database import create_db_and_tables # Optional: For initial setup

app = FastAPI(title="WikiClone API")

# CORS Configuration (adjust origins as needed)
origins = [
    "http://localhost", # Allow localhost for local dev
    "http://localhost:3004", # Your Next.js frontend default port
    "http://localhost:3002"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allows all headers
)

# Optional: Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(articles.router, prefix="/articles", tags=["Articles"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(music.router, prefix="/music", tags=["Music"])
app.include_router(video.router, prefix="/videos", tags=["Videos"])
app.include_router(books.router, prefix="/books", tags=["Books"])



@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the WikiClone API"}

# Optional: Event handler to create tables on startup (for dev only)
# @app.on_event("startup")
# async def on_startup():
#     print("Creating database tables...")
#     await create_db_and_tables()
#     print("Database tables created (if they didn't exist).")