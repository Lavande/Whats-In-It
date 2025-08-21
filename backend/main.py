from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from api.routes import barcode, analysis
from core.config import settings

app = FastAPI(
    title="What's In It API",
    description="API for analyzing food products based on barcode scanning",
    version="0.1.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, in production this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(barcode.router, prefix="/api/v1", tags=["barcode"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to What's In It API",
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    return {"status": "healthy", "service": "What's In It API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 