from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api import auth, users, tweets, analytics, content, scheduled_posts
from app.core.config import settings

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AutoReach API",
    description="Twitter Growth Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tweets.router, prefix="/api/tweets", tags=["tweets"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(scheduled_posts.router, prefix="/api/scheduled-posts", tags=["scheduled-posts"])

# API health check endpoint


@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "version": "1.0.0", "api": "ready"}


@app.get("/")
async def root():
    return {"message": "Welcome to AutoReach API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
