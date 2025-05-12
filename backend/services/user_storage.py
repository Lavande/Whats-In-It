import json
import os
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

from schemas.user import UserPreferences, ScanHistory

logger = logging.getLogger(__name__)

class UserStorageService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.preferences_file = os.path.join(self.data_dir, "preferences.json")
        self.history_file = os.path.join(self.data_dir, "scan_history.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        self._init_files()
    
    def _init_files(self):
        """Initialize storage files if they don't exist"""
        if not os.path.exists(self.preferences_file):
            with open(self.preferences_file, 'w') as f:
                json.dump({
                    "diet_type": None,
                    "allergens": [],
                    "forbidden_ingredients": []
                }, f)
        
        if not os.path.exists(self.history_file):
            with open(self.history_file, 'w') as f:
                json.dump([], f)
    
    def get_user_preferences(self) -> UserPreferences:
        """Get user preferences"""
        try:
            with open(self.preferences_file, 'r') as f:
                data = json.load(f)
                return UserPreferences(**data)
        except Exception as e:
            logger.error(f"Error loading user preferences: {e}")
            return UserPreferences()
    
    def save_user_preferences(self, preferences: UserPreferences) -> bool:
        """Save user preferences"""
        try:
            with open(self.preferences_file, 'w') as f:
                json.dump(preferences.dict(), f)
            return True
        except Exception as e:
            logger.error(f"Error saving user preferences: {e}")
            return False
    
    def get_scan_history(self) -> List[ScanHistory]:
        """Get scan history"""
        try:
            with open(self.history_file, 'r') as f:
                data = json.load(f)
                
                # Convert string datetime to datetime objects
                for item in data:
                    if isinstance(item["timestamp"], str):
                        item["timestamp"] = datetime.fromisoformat(item["timestamp"])
                
                return [ScanHistory(**item) for item in data]
        except Exception as e:
            logger.error(f"Error loading scan history: {e}")
            return []
    
    def add_scan_history(self, scan: ScanHistory) -> bool:
        """Add a new scan to the history"""
        try:
            history = self.get_scan_history()
            
            # Convert to dict for JSON serialization
            scan_dict = scan.dict()
            scan_dict["timestamp"] = scan_dict["timestamp"].isoformat()
            
            # Get current history
            with open(self.history_file, 'r') as f:
                history_data = json.load(f)
            
            # Add new scan
            history_data.append(scan_dict)
            
            # Keep only the last 100 scans
            if len(history_data) > 100:
                history_data = history_data[-100:]
            
            # Save back to file
            with open(self.history_file, 'w') as f:
                json.dump(history_data, f)
            
            return True
        except Exception as e:
            logger.error(f"Error adding scan to history: {e}")
            return False
    
    def clear_scan_history(self) -> bool:
        """Clear scan history"""
        try:
            with open(self.history_file, 'w') as f:
                json.dump([], f)
            return True
        except Exception as e:
            logger.error(f"Error clearing scan history: {e}")
            return False

user_storage_service = UserStorageService() 