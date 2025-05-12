from fastapi import APIRouter, HTTPException, Path, Query, Depends
from typing import Optional, List
from datetime import datetime

from schemas.food import FoodProduct
from schemas.user import ScanHistory
from services.openfoodfacts import openfoodfacts_service
from services.perplexity import perplexity_service
from services.user_storage import user_storage_service

router = APIRouter()

@router.get("/product/{barcode}", response_model=FoodProduct)
async def get_product_by_barcode(
    barcode: str = Path(..., description="Product barcode (EAN, UPC, etc.)"),
):
    """
    Get basic product information by barcode from OpenFoodFacts
    """
    product = await openfoodfacts_service.get_product_by_barcode(barcode)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@router.get("/product/{barcode}/additives")
async def get_product_additives(
    barcode: str = Path(..., description="Product barcode (EAN, UPC, etc.)"),
):
    """
    Get additives analysis for a product
    """
    # First get the product info
    product = await openfoodfacts_service.get_product_by_barcode(barcode)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Then analyze additives
    additives = await perplexity_service.analyze_additives(product)
    
    # Update product with additives
    product.additives = additives
    
    return {
        "additives": additives,
        "product": product
    }

@router.post("/scan/{barcode}")
async def scan_product(
    barcode: str = Path(..., description="Product barcode (EAN, UPC, etc.)"),
    diet_type: Optional[str] = Query(None, description="Diet type to check compatibility")
):
    """
    Complete scan workflow:
    1. Get product by barcode
    2. Analyze additives
    3. Analyze diet compatibility (if requested)
    4. Generate recommendations
    5. Save to history
    """
    # Get product info
    product = await openfoodfacts_service.get_product_by_barcode(barcode)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Analyze additives
    product.additives = await perplexity_service.analyze_additives(product)
    
    # Get user preferences
    user_prefs = user_storage_service.get_user_preferences()
    
    # Determine which diet type to analyze
    diet_types = []
    if diet_type:
        diet_types.append(diet_type)
    elif user_prefs.diet_type:
        diet_types.append(user_prefs.diet_type)
    else:
        # Default to a common diet type if none specified
        diet_types.append("balanced")
    
    # Analyze compatibility for each diet type
    diet_compatibilities = []
    for dt in diet_types:
        compatibility = await perplexity_service.analyze_diet_compatibility(product, dt)
        diet_compatibilities.append(compatibility)
    
    # Generate overall recommendation
    analysis_result = await perplexity_service.generate_recommendations(product, diet_compatibilities)
    
    # Save to scan history
    scan_record = ScanHistory(
        barcode=barcode,
        name=product.name,
        timestamp=datetime.now(),
        recommendation=analysis_result.overall_recommendation
    )
    user_storage_service.add_scan_history(scan_record)
    
    return analysis_result 