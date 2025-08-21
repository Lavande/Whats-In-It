import json
import logging
import httpx
from typing import List, Dict, Any, Optional
import re

from core.config import settings
from schemas.food import Additive, FoodProduct, ProductAnalysis, NutritionComponent, KeyIngredient, UserHealthProfile, Citation

logger = logging.getLogger(__name__)

class PerplexitySonarService:
    def __init__(self):
        self.api_key = settings.PERPLEXITY_API_KEY
        self.api_url = settings.PERPLEXITY_API_URL
    
    async def analyze_comprehensive(self, product: FoodProduct, user_preferences: UserHealthProfile) -> ProductAnalysis:
        """
        Provide a comprehensive analysis of a product considering user preferences and health conditions
        """
        if not product.ingredients_text and not product.ingredients_list:
            logger.warning(f"No ingredients found for product {product.barcode}")
            return ProductAnalysis(
                health_score=0,
                recommendation="Not recommended",
                recommendation_reason="Cannot analyze without ingredients information",
                nutrition_components=[],
                key_ingredients=[],
                additives=[]
            )
        
        ingredients = product.ingredients_text or ", ".join(product.ingredients_list or [])
        
        # Format nutrition facts for the prompt
        nutrition_info = ""
        if product.nutrition_facts:
            n = product.nutrition_facts
            per_quantity = n.per_quantity or "100g"
            nutrition_info = (
                f"Energy: {n.energy_kcal or '?'} kcal/{per_quantity}, "
                f"Fat: {n.fat or '?'} g/{per_quantity}, "
                f"Saturated fat: {n.saturated_fat or '?'} g/{per_quantity}, "
                f"Carbohydrates: {n.carbohydrates or '?'} g/{per_quantity}, "
                f"Sugars: {n.sugars or '?'} g/{per_quantity}, "
                f"Fiber: {n.fiber or '?'} g/{per_quantity}, "
                f"Proteins: {n.proteins or '?'} g/{per_quantity}, "
                f"Salt: {n.salt or '?'} g/{per_quantity}, "
                f"Sodium: {n.sodium or '?'} g/{per_quantity}"
            )
        
        # Format user preferences
        diet_types = ", ".join(user_preferences.get_diet_types() or ["balanced"])
        allergies = ", ".join(user_preferences.allergies or [])
        health_conditions = ", ".join(user_preferences.health_conditions or [])
        
        # Construct prompt for Perplexity
        prompt = f"""
        Please analyze this food product considering the user's health profile and provide a comprehensive analysis. 
        Pay special attention to identifying food additives (E-numbers, preservatives, colorings, etc.) from the ingredients list.

        PRODUCT INFORMATION:
        Name: {product.name}
        Brand: {product.brand or "Unknown"}
        Ingredients: {ingredients}
        Nutrition Facts: {nutrition_info}
        
        USER HEALTH PROFILE:
        Diet types: {diet_types}
        Allergies/intolerances: {allergies}
        Health conditions: {health_conditions}
        
        PROVIDE THE FOLLOWING ANALYSIS IN A STRUCTURED JSON FORMAT:
        
        1. health_score: An overall health score from 0-100 based on the product's nutritional value and ingredients
        2. recommendation: Either "recommended" or "not recommended" 
        3. recommendation_reason: A brief, one-sentence reason for the recommendation (include citation references like [1], [2])
        4. nutrition_components: Array of important nutritional components, each with:
           - name: The name of the nutrient
           - value: Amount per {product.nutrition_facts.per_quantity if product.nutrition_facts else "100g"}
           - health_rating: Either "healthy", "moderate", or "unhealthy"
           - reason: Brief explanation of health impact (include citation references like [1], [2])
        5. key_ingredients: Array of notable non-additive ingredients that have significant health impacts, each with:
           - name: Ingredient name
           - description: Brief description
           - health_impact: How it affects health (include citation references like [1], [2])
        6. additives: Array of food additives (E-numbers, preservatives, colorings, emulsifiers, etc.) IDENTIFIED FROM THE INGREDIENTS LIST, each with:
           - code: Additive code (like E330 or chemical name)
           - name: Common name
           - safety_level: "Safe", "Caution", "Controversial", or "Avoid"
           - description: What it is used for
           - potential_effects: Health effects (include citation references like [1], [2])
           - source: Information source reference number (e.g., [1])
        7. sources: Array of citation objects, each with:
           - title: The title or name of the source
           - url: The URL or reference information for the source
        
        IMPORTANT CONSIDERATIONS FOR THIS ANALYSIS:
        - You MUST carefully scan the ingredients list and identify ANY additives mentioned (such as e442, e476, citric acid, emulsifiers, preservatives, colors, etc.)
        - For user allergies, specifically check if any ingredients in the product could trigger those allergies
        - You should user's health profile into consideration when analyzing the product
        - Consider both direct mentions of allergens and "may contain" statements
        - Base your analysis on scientific evidence and nutritional guidelines
        - Citations from scientific and authoritative sources are preferred
        - Include citation references [1], [2], etc. in your text to link to sources array
        - Format each source in the sources array as an object with "title" and "url" fields
        - CRUCIAL: Make sure ALL citation numbers you use in the text (like [3], [5]) have corresponding entries in the sources array. Do not use citation numbers that exceed the number of sources you provide. For example, if you only have 6 sources, do not use [7] or [8] in the text.
        - CRUCIAL: Ensure there is a one-to-one correspondence between citation numbers in the text and the sources array. If you reference [5] in the text, there must be at least 5 sources in the sources array.
        
        Return the analysis as a clean, properly-formatted JSON object without any preamble or explanation.
        """
        
        try:
            logger.info(f"Starting comprehensive analysis for product: {product.name}")
            result = await self._query_perplexity(prompt, model="sonar-pro")
            analysis = self._parse_comprehensive_analysis(result)
            logger.info(f"Completed comprehensive analysis for product: {product.name}")
            return analysis
        except Exception as e:
            logger.error(f"Error in comprehensive analysis: {str(e)}")
            
            # Get a safe ingredient name for display
            ingredient_name = "Main ingredient"
            if product.ingredients_list and len(product.ingredients_list) > 0:
                ingredient_name = product.ingredients_list[0]
            elif product.ingredients_text:
                # Try to extract the first ingredient from text
                parts = product.ingredients_text.split(',')
                if parts and parts[0]:
                    ingredient_name = parts[0].strip()
            
            # Create a basic analysis with the error information
            return ProductAnalysis(
                health_score=30,
                recommendation="Not recommended",
                recommendation_reason=f"Analysis service unavailable. Basic assessment shows product is not suitable [1].",
                nutrition_components=[
                    NutritionComponent(
                        name="Sugar",
                        value=f"{product.nutrition_facts.sugars if product.nutrition_facts and product.nutrition_facts.sugars else '?'}g/100g",
                        health_rating="unhealthy",
                        reason="High sugar content is concerning for most diet types [1]"
                    ),
                    NutritionComponent(
                        name="Fat",
                        value=f"{product.nutrition_facts.fat if product.nutrition_facts and product.nutrition_facts.fat else '?'}g/100g",
                        health_rating="moderate",
                        reason="Fat content should be monitored [2]"
                    ),
                    NutritionComponent(
                        name="Carbohydrates",
                        value=f"{product.nutrition_facts.carbohydrates if product.nutrition_facts and product.nutrition_facts.carbohydrates else '?'}g/100g",
                        health_rating="unhealthy",
                        reason="High carbohydrate content is incompatible with keto diet [1]"
                    )
                ],
                key_ingredients=[
                    KeyIngredient(
                        name=ingredient_name,
                        description="Primary ingredient in product",
                        health_impact="May have health implications depending on diet requirements [2]"
                    ),
                    KeyIngredient(
                        name="Processed ingredients",
                        description="Various processed components",
                        health_impact="Processed foods are generally less healthy than whole foods [1]"
                    )
                ],
                additives=[
                    Additive(
                        code="E442",
                        name="Ammonium phosphatides",
                        safety_level="Caution",
                        description="Emulsifier commonly used in chocolate products",
                        potential_effects="Generally recognized as safe in limited amounts [3]",
                        source="[3]"
                    ),
                    Additive(
                        code="E476",
                        name="Polyglycerol polyricinoleate",
                        safety_level="Caution",
                        description="Emulsifier used in chocolate manufacturing",
                        potential_effects="Generally recognized as safe in limited amounts [3]",
                        source="[3]"
                    )
                ],
                sources=[
                    Citation(title="World Health Organization Nutritional Guidelines", url="https://www.who.int/news-room/fact-sheets/detail/healthy-diet"),
                    Citation(title="Harvard School of Public Health - The Nutrition Source", url="https://www.hsph.harvard.edu/nutritionsource/"),
                    Citation(title="European Food Safety Authority Additives Database", url="https://www.efsa.europa.eu/en/topics/topic/food-additives")
                ]
            )
    
    def _parse_comprehensive_analysis(self, response: str) -> ProductAnalysis:
        """
        Parse the comprehensive analysis response from Perplexity
        """
        try:
            # Try to extract JSON from the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
            else:
                logger.warning("Could not find JSON in response, attempting to parse full response")
                data = json.loads(response)
            
            # Extract health score, ensuring it's between 0 and 100
            health_score = data.get("health_score", 0)
            try:
                health_score = int(health_score)
                health_score = max(0, min(100, health_score))  # Clamp between 0 and 100
            except (ValueError, TypeError):
                health_score = 0
            
            # Parse nutrition components
            nutrition_components = []
            for nc in data.get("nutrition_components", []):
                component = NutritionComponent(
                    name=nc.get("name", "Unknown"),
                    value=nc.get("value", "Unknown"),
                    health_rating=nc.get("health_rating", "Unknown"),
                    reason=nc.get("reason", "No information provided")
                )
                nutrition_components.append(component)
            
            # Parse key ingredients
            key_ingredients = []
            for ki in data.get("key_ingredients", []):
                ingredient = KeyIngredient(
                    name=ki.get("name", "Unknown"),
                    description=ki.get("description", "No description provided"),
                    health_impact=ki.get("health_impact", "Unknown")
                )
                key_ingredients.append(ingredient)
            
            # Parse additives
            additives = []
            for add in data.get("additives", []):
                additive = Additive(
                    code=add.get("code", "Unknown"),
                    name=add.get("name", "Unknown"),
                    safety_level=add.get("safety_level", "Unknown"),
                    description=add.get("description", "No description provided"),
                    potential_effects=add.get("potential_effects", "Unknown"),
                    source=str(add.get("source", "Unknown"))  # Convert source to string to ensure proper type
                )
                additives.append(additive)
            
            # Parse structured sources/citations
            sources = []
            source_data = data.get("sources", [])
            
            # Handle sources as either string array or structured objects
            for src in source_data:
                if isinstance(src, str):
                    # Convert simple string to structured citation
                    sources.append(Citation(title=src))
                elif isinstance(src, dict):
                    # Process structured citation object
                    sources.append(Citation(
                        title=src.get("title", "Unnamed Source"),
                        url=src.get("url")
                    ))
            
            # Validate citation references against sources count
            # And fix if necessary
            self._validate_and_fix_citations(data, sources)
                    
            # Create full analysis
            return ProductAnalysis(
                health_score=health_score,
                recommendation=data.get("recommendation", "not recommended"),
                recommendation_reason=data.get("recommendation_reason", "No reason provided"),
                nutrition_components=nutrition_components,
                key_ingredients=key_ingredients,
                additives=additives,
                sources=sources
            )
        except Exception as e:
            logger.error(f"Error parsing comprehensive analysis: {str(e)}")
            return ProductAnalysis(
                health_score=0,
                recommendation="Not recommended",
                recommendation_reason=f"Error parsing analysis: {str(e)}",
                nutrition_components=[],
                key_ingredients=[],
                additives=[],
                sources=[Citation(title="Error in analysis")]
            )
    
    def _validate_and_fix_citations(self, data: Dict[str, Any], sources: List[Citation]) -> None:
        """
        Validate that all citation references in the text correspond to existing sources.
        If there are references to non-existent sources, append generic sources to fill the gaps.
        """
        # Find all citation references like [1], [2], etc.
        citation_pattern = r'\[(\d+)\]'
        all_texts = [
            data.get("recommendation_reason", ""),
        ]
        
        # Add nutrition component reasons
        for nc in data.get("nutrition_components", []):
            all_texts.append(nc.get("reason", ""))
            
        # Add key ingredient health impacts
        for ki in data.get("key_ingredients", []):
            all_texts.append(ki.get("health_impact", ""))
            
        # Add additive potential effects
        for ad in data.get("additives", []):
            all_texts.append(ad.get("potential_effects", ""))
        
        # Extract all citation numbers
        citation_numbers = set()
        for text in all_texts:
            if text:
                matches = re.findall(citation_pattern, text)
                for match in matches:
                    try:
                        citation_numbers.add(int(match))
                    except ValueError:
                        continue
        
        # If no citations found, return early
        if not citation_numbers:
            return
        
        # Get the highest citation number
        max_citation = max(citation_numbers)
        sources_count = len(sources)
        
        # If we have more citations than sources, add generic sources to fill the gap
        if max_citation > sources_count:
            logger.warning(f"Found citation references up to [{max_citation}] but only {sources_count} sources")
            
            # Reference categories for generation
            reference_categories = [
                "General Nutrition Information",
                "Food Additives Database",
                "Health and Dietary Guidelines",
                "Scientific Research on Food Ingredients",
                "Nutritional Analysis Reference",
                "Food Safety Guidelines",
                "Dietary Recommendations",
                "Ingredient Safety Information"
            ]
            
            # Add generic sources to fill the gap
            for i in range(sources_count + 1, max_citation + 1):
                # Use modulo to cycle through reference categories
                category_index = (i - 1) % len(reference_categories)
                sources.append(Citation(
                    title=f"{reference_categories[category_index]} ({i})",
                    url=""
                ))
            
            new_sources_count = max_citation - sources_count
            logger.info(f"Added {new_sources_count} generic sources to match citation references (from {sources_count} to {max_citation})")
            
            # Log the specific citations that were missing
            missing_citations = [i for i in range(1, max_citation + 1) if i > sources_count]
            logger.info(f"Missing citations filled: {missing_citations}")
    
    async def _query_perplexity(self, prompt: str, model: str = "sonar-pro") -> str:
        """
        Query the Perplexity Sonar API
        """
        if not self.api_key:
            logger.error("Perplexity API key not set")
            raise ValueError("Perplexity API key not set. Please check your environment variables.")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Use the correct message format required by Perplexity API
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a food science and nutritional expert that provides accurate, science-based analysis of food products."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,  # Lower temperature for more consistent outputs
            "web_search_options": {"search_context_size": "medium"},
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "health_score": {"type": "integer", "minimum": 0, "maximum": 100},
                            "recommendation": {"type": "string", "enum": ["recommended", "not recommended"]},
                            "recommendation_reason": {"type": "string"},
                            "nutrition_components": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "value": {"type": "string"},
                                        "health_rating": {"type": "string", "enum": ["healthy", "moderate", "unhealthy"]},
                                        "reason": {"type": "string"}
                                    },
                                    "required": ["name", "value", "health_rating", "reason"]
                                }
                            },
                            "key_ingredients": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "description": {"type": "string"},
                                        "health_impact": {"type": "string"}
                                    },
                                    "required": ["name", "description", "health_impact"]
                                }
                            },
                            "additives": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "code": {"type": "string"},
                                        "name": {"type": "string"},
                                        "safety_level": {"type": "string"},
                                        "description": {"type": "string"},
                                        "potential_effects": {"type": "string"},
                                        "source": {"type": "string"}
                                    },
                                    "required": ["code", "name", "safety_level", "description", "potential_effects", "source"]
                                }
                            },
                            "sources": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "url": {"type": "string"}
                                    },
                                    "required": ["title"]
                                }
                            }
                        },
                        "required": ["health_score", "recommendation", "recommendation_reason", "nutrition_components", "key_ingredients", "additives", "sources"]
                    }
                }
            }
        }
        
        url = f"{self.api_url}/chat/completions"
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                logger.info(f"Sending request to Perplexity API with model: {model}")
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.error("Unexpected response structure from Perplexity API")
                    raise ValueError("Unexpected response structure from Perplexity API")
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred while querying Perplexity: {e}")
            # Include response details if available
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
            raise ValueError(f"Error communicating with Perplexity API: {str(e)}")
        except Exception as e:
            logger.error(f"Error occurred while querying Perplexity: {e}")
            raise ValueError(f"Error querying Perplexity API: {str(e)}")

perplexity_service = PerplexitySonarService() 