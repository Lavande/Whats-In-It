from fastapi import APIRouter, HTTPException, Body, Path, Query
from typing import List, Dict, Any

from schemas.food import FoodProduct, DietCompatibility
from services.perplexity import perplexity_service

router = APIRouter()

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