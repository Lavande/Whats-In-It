import httpx
import logging
from typing import Dict, Any, Optional

from core.config import settings
from schemas.food import FoodProduct, NutritionFacts

logger = logging.getLogger(__name__)

class OpenFoodFactsService:
    def __init__(self):
        self.base_url = settings.OPENFOODFACTS_API_URL
        self.cache = {}  # Simple in-memory cache
        self.user_agent = settings.OPENFOODFACTS_USER_AGENT
        
    async def get_product_by_barcode(self, barcode: str) -> Optional[FoodProduct]:
        """
        Fetch product information from Open Food Facts API by barcode
        """
        # Check cache first
        if barcode in self.cache:
            logger.info(f"Cache hit for barcode {barcode}")
            return self.cache[barcode]
        
        url = f"{self.base_url}/product/{barcode}"
        
        try:
            headers = {
                "User-Agent": self.user_agent
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != 1:
                    logger.warning(f"Product not found: {barcode}")
                    return None
                
                product = self._parse_product_data(data["product"], barcode)
                
                # Cache the result
                self.cache[barcode] = product
                return product
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred while fetching product {barcode}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error occurred while fetching product {barcode}: {e}")
            return None
    
    def _parse_product_data(self, data: Dict[str, Any], barcode: str) -> FoodProduct:
        """
        Parse the OpenFoodFacts API response into our FoodProduct model
        """
        # Extract nutrition facts
        nutrition = NutritionFacts(
            energy_kj=self._extract_nutrient(data, "energy-kj"),
            energy_kcal=self._extract_nutrient(data, "energy-kcal") or self._extract_nutrient(data, "energy"),
            fat=self._extract_nutrient(data, "fat"),
            saturated_fat=self._extract_nutrient(data, "saturated-fat"),
            carbohydrates=self._extract_nutrient(data, "carbohydrates"),
            sugars=self._extract_nutrient(data, "sugars"),
            fiber=self._extract_nutrient(data, "fiber"),
            proteins=self._extract_nutrient(data, "proteins"),
            salt=self._extract_nutrient(data, "salt"),
            sodium=self._extract_nutrient(data, "sodium")
        )
        
        # Extract ingredients
        ingredients_text = data.get("ingredients_text", "")
        ingredients_list = []
        if "ingredients" in data and isinstance(data["ingredients"], list):
            ingredients_list = [ing.get("text", "") for ing in data["ingredients"] if "text" in ing]
        
        # Create food product
        product = FoodProduct(
            barcode=barcode,
            name=data.get("product_name", "Unknown Product"),
            brand=data.get("brands", None),
            image_url=data.get("image_url", None),
            ingredients_text=ingredients_text,
            ingredients_list=ingredients_list,
            nutrition_facts=nutrition,
            additives=None,  # Will be filled by the additive analysis service
            nutriscore=data.get("nutriscore_grade", None)
        )
        
        return product
    
    def _extract_nutrient(self, data: Dict[str, Any], nutrient_name: str) -> Optional[float]:
        """
        Extract a nutrient value from the product data
        """
        if "nutriments" not in data:
            return None
        
        nutriments = data["nutriments"]
        if nutrient_name in nutriments:
            try:
                return float(nutriments[nutrient_name])
            except (ValueError, TypeError):
                return None
        
        return None

openfoodfacts_service = OpenFoodFactsService() 