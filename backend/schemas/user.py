from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class UserPreferences(BaseModel):
    diet_type: Optional[str] = None  # keto, vegan, low-carb, etc.
    allergens: Optional[List[str]] = []
    forbidden_ingredients: Optional[List[str]] = []


class ScanHistory(BaseModel):
    barcode: str
    name: str
    timestamp: datetime
    recommendation: str 