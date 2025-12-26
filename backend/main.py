from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from contextlib import asynccontextmanager

from database import get_db
from routers import auth, expenses, ocr
from models.base import Base

# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AI Expense Tracker API...")
    yield
    # Shutdown
    print("Shutting down AI Expense Tracker API...")

# Create FastAPI app
app = FastAPI(
    title="AI Expense Tracker API",
    description="AI-powered expense tracking with OCR receipt processing and spending predictions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
# Get allowed origins from environment or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "AI Expense Tracker API is running",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "AI Expense Tracker API",
        "description": "AI-powered expense tracking with OCR receipt processing and spending predictions",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "HTTPException"
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": "InternalServerError"
            }
        }
    )

# Development server info
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )
