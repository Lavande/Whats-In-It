from fastapi import APIRouter, HTTPException, Body, Path
from typing import List

from schemas.user import UserPreferences, ScanHistory
from services.user_storage import user_storage_service

router = APIRouter()

@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences():
    """
    Get user dietary preferences
    """
    return user_storage_service.get_user_preferences()

@router.post("/preferences", response_model=UserPreferences)
async def update_user_preferences(preferences: UserPreferences):
    """
    Update user dietary preferences
    """
    success = user_storage_service.save_user_preferences(preferences)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save user preferences")
    
    return preferences

@router.get("/history", response_model=List[ScanHistory])
async def get_scan_history():
    """
    Get user scan history
    """
    return user_storage_service.get_scan_history()

@router.delete("/history")
async def clear_scan_history():
    """
    Clear scan history
    """
    success = user_storage_service.clear_scan_history()
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear scan history")
    
    return {"message": "Scan history cleared successfully"} 