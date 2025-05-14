from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional, List
import logging

from schemas.food import FoodProduct
from services.openfoodfacts import openfoodfacts_service

router = APIRouter()
logger = logging.getLogger(__name__)

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