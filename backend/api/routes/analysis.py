from fastapi import APIRouter, HTTPException, Body, Path, Query
from typing import List, Dict, Any
import logging

from schemas.food import FoodProduct, DietCompatibility, ProductAnalysis, UserHealthProfile
from services.perplexity import perplexity_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze-diet-compatibility", response_model=List[DietCompatibility])
async def analyze_diet_compatibility(
    product: FoodProduct = Body(..., description="Food product information"),
    diet_types: List[str] = Query(["balanced"], description="Diet types to analyze")
):
    """
    Analyze compatibility of a product with specified diet types
    """
    if not product:
        raise HTTPException(status_code=400, detail="Product information required")
    
    if not product.ingredients_text and not product.ingredients_list:
        raise HTTPException(status_code=400, detail="Product ingredients required for analysis")
    
    # Analyze compatibility for each diet type
    compatibilities = []
    for diet_type in diet_types:
        compatibility = await perplexity_service.analyze_diet_compatibility(product, diet_type)
        compatibilities.append(compatibility)
    
    return compatibilities

@router.post("/analyze-additives")
async def analyze_additives(
    product: FoodProduct = Body(..., description="Food product information")
):
    """
    Analyze additives in a product
    """
    if not product:
        raise HTTPException(status_code=400, detail="Product information required")
    
    if not product.ingredients_text and not product.ingredients_list:
        raise HTTPException(status_code=400, detail="Product ingredients required for analysis")
    
    additives = await perplexity_service.analyze_additives(product)
    return {"additives": additives}

@router.post("/analyze-comprehensive", response_model=ProductAnalysis)
async def analyze_comprehensive(
    product: FoodProduct = Body(..., description="Food product information from barcode scan"),
    user_preferences: UserHealthProfile = Body(..., description="User health preferences and conditions")
):
    """
    Provide comprehensive analysis of a product based on user preferences
    
    This endpoint analyzes a product from a holistic health perspective by:
    - Calculating an overall health score (0-100)
    - Providing a recommendation on whether to consume the product
    - Analyzing nutritional components and their health impacts
    - Identifying key non-additive ingredients and their effects
    - Detecting and evaluating food additives from the ingredients list
    - Including academic and authoritative sources
    
    The analysis considers the user's diet preferences, allergies, and health conditions.
    
    Request body should include:
    - Product data (as returned by the barcode scan endpoint)
    - User health profile with diet types, allergies, and health conditions
    """
    if not product:
        raise HTTPException(status_code=400, detail="Product information required")
    
    if not product.ingredients_text and not product.ingredients_list:
        raise HTTPException(status_code=400, detail="Product ingredients required for analysis")
    
    try:
        analysis = await perplexity_service.analyze_comprehensive(product, user_preferences)
        return analysis
    except Exception as e:
        logger.error(f"Error in comprehensive analysis endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to analyze product: {str(e)}"
        ) 