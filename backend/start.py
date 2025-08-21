#!/usr/bin/env python3
"""
Production startup script for What's In It API
"""
import os
import uvicorn
from main import app

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting What's In It API on {host}:{port}")
    
    # Run with production settings
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )