from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class Additive(BaseModel):
    code: str
    name: str
    safety_level: Optional[str] = None  # Safe, Caution, Controversial, Avoid
    description: Optional[str] = None
    potential_effects: Optional[str] = None
    source: Optional[str] = None


class NutritionFacts(BaseModel):
    energy_kj: Optional[float] = None
    energy_kcal: Optional[float] = None
    fat: Optional[float] = None
    saturated_fat: Optional[float] = None
    carbohydrates: Optional[float] = None
    sugars: Optional[float] = None
    fiber: Optional[float] = None
    proteins: Optional[float] = None
    salt: Optional[float] = None
    sodium: Optional[float] = None


class FoodProduct(BaseModel):
    barcode: str
    name: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    ingredients_text: Optional[str] = None
    ingredients_list: Optional[List[str]] = None
    nutrition_facts: Optional[NutritionFacts] = None
    additives: Optional[List[Additive]] = None
    nutriscore: Optional[str] = None  # A, B, C, D, E


class DietCompatibility(BaseModel):
    diet_type: str  # keto, vegan, low-carb, etc.
    compatibility_score: float = Field(..., ge=0, le=100)  # percentage (0-100)
    incompatible_ingredients: Optional[List[str]] = None
    recommendations: Optional[str] = None


class DietAnalysisResult(BaseModel):
    product: FoodProduct
    compatibility: List[DietCompatibility] = []
    overall_recommendation: str  # Recommended, Caution, Not Recommended
    recommendation_reason: str
    alternatives: Optional[List[str]] = None 