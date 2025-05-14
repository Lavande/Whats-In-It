import logging
from typing import List, Optional
from schemas.user import UserPreferences, ScanHistory

logger = logging.getLogger(__name__)

class UserStorageService:
    """
    Stub implementation of the UserStorageService that doesn't save anything.
    The related endpoints have been removed, but this class is kept for compatibility.
    """
    
    def get_user_preferences(self) -> UserPreferences:
        """Return empty user preferences"""
        return UserPreferences()
    
    def save_user_preferences(self, preferences: UserPreferences) -> bool:
        """Stub implementation that always returns True"""
        return True
    
    def get_scan_history(self) -> List[ScanHistory]:
        """Return empty scan history"""
        return []
    
    def add_scan_history(self, scan: ScanHistory) -> bool:
        """Stub implementation that always returns True"""
        return True
    
    def clear_scan_history(self) -> bool:
        """Stub implementation that always returns True"""
        return True

user_storage_service = UserStorageService() 