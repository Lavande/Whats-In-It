#!/usr/bin/env python3
"""
Production startup script for What's In It API
"""
import os
import sys
import logging
import uvicorn

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting What's In It API on {host}:{port}")
    logger.info(f"Python path: {sys.path}")
    logger.info(f"Current working directory: {os.getcwd()}")
    
    # Check if PERPLEXITY_API_KEY is set
    if not os.getenv("PERPLEXITY_API_KEY"):
        logger.warning("PERPLEXITY_API_KEY environment variable not set")
    else:
        logger.info("PERPLEXITY_API_KEY is configured")
    
    # Run with production settings
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )