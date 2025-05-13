import json
import logging
import httpx
from typing import List, Dict, Any, Optional

from core.config import settings
from schemas.food import Additive, FoodProduct, DietCompatibility, DietAnalysisResult, ProductAnalysis, NutritionComponent, KeyIngredient, UserHealthProfile

logger = logging.getLogger(__name__)

class PerplexitySonarService:
    def __init__(self):
        self.api_key = settings.PERPLEXITY_API_KEY
        self.api_url = settings.PERPLEXITY_API_URL
        
    async def analyze_additives(self, product: FoodProduct) -> List[Additive]:
        """
        Analyze additives in a product using Perplexity Sonar API
        """
        if not product.ingredients_text and not product.ingredients_list:
            logger.warning(f"No ingredients found for product {product.barcode}")
            return []
        
        ingredients = product.ingredients_text or ", ".join(product.ingredients_list or [])
        
        # Debug log to see what ingredients are being processed
        logger.info(f"Analyzing additives for product {product.barcode} with ingredients: {ingredients[:100]}...")
        
        # Construct the prompt for Perplexity
        prompt = f"""
        Please analyze the following food product ingredients and identify all food additives (E-numbers, preservatives, colorings, etc.).
        For each additive, provide:
        1. The code (like E330 or the chemical name)
        2. The common name
        3. Safety level (Safe, Caution, Controversial, Avoid)
        4. Brief description (what it is used for)
        5. Potential health effects
        6. Source of information (research organization or authority)
        
        Format the response as a JSON array of objects with these fields.
        
        Ingredients: {ingredients}
        """
        
        try:
            result = await self._query_perplexity(prompt)
            logger.info(f"Received response from Perplexity: {result[:100]}...")
            additives = self._parse_additives_response(result)
            logger.info(f"Parsed {len(additives)} additives from response")
            return additives
        except Exception as e:
            logger.error(f"Error analyzing additives: {str(e)}")
            # For debugging purposes, return a test additive
            logger.info("Returning test additive for debugging")
            return [
                Additive(
                    code="E330",
                    name="Citric Acid",
                    safety_level="Safe",
                    description="Used as an acidifier and antioxidant",
                    potential_effects="Generally recognized as safe",
                    source="FDA"
                )
            ]
    
    async def analyze_diet_compatibility(self, product: FoodProduct, diet_type: str) -> DietCompatibility:
        """
        Analyze compatibility of a product with a specific diet type
        """
        if not product.ingredients_text and not product.ingredients_list:
            logger.warning(f"No ingredients found for product {product.barcode}")
            return DietCompatibility(
                diet_type=diet_type,
                compatibility_score=0,
                incompatible_ingredients=["Unknown - no ingredients listed"],
                recommendations="Cannot analyze without ingredients information"
            )
        
        ingredients = product.ingredients_text or ", ".join(product.ingredients_list or [])
        nutrition = product.nutrition_facts
        
        # Construct prompt based on diet type
        nutrition_info = ""
        if nutrition:
            nutrition_info = f"""
            Nutrition information (per 100g):
            - Energy: {nutrition.energy_kcal or 'Unknown'} kcal
            - Fat: {nutrition.fat or 'Unknown'} g
            - Saturated fat: {nutrition.saturated_fat or 'Unknown'} g
            - Carbohydrates: {nutrition.carbohydrates or 'Unknown'} g
            - Sugars: {nutrition.sugars or 'Unknown'} g 
            - Fiber: {nutrition.fiber or 'Unknown'} g
            - Proteins: {nutrition.proteins or 'Unknown'} g
            - Salt: {nutrition.salt or 'Unknown'} g
            """
        
        prompt = f"""
        Please analyze this food product for compatibility with a {diet_type} diet.
        
        Product: {product.name}
        Ingredients: {ingredients}
        {nutrition_info}
        
        Provide the following as a JSON object:
        1. compatibility_score: A number from 0-100 representing how compatible this product is with a {diet_type} diet
        2. incompatible_ingredients: An array of ingredients that are incompatible with the diet
        3. recommendations: Brief advice for someone following this diet
        
        Format your response as a valid JSON object with these fields.
        """
        
        try:
            result = await self._query_perplexity(prompt)
            diet_analysis = self._parse_diet_compatibility_response(result, diet_type)
            return diet_analysis
        except Exception as e:
            logger.error(f"Error analyzing diet compatibility: {e}")
            # Return test data for debugging
            logger.info(f"Returning test compatibility data for {diet_type}")
            return DietCompatibility(
                diet_type=diet_type,
                compatibility_score=50,
                incompatible_ingredients=["Sample incompatible ingredient"],
                recommendations="This is a test recommendation. The API call failed but this allows testing the display."
            )
    
    async def generate_recommendations(self, product: FoodProduct, diet_compatibilities: List[DietCompatibility]) -> DietAnalysisResult:
        """
        Generate overall recommendations and alternatives based on product analysis
        """
        diet_types = [comp.diet_type for comp in diet_compatibilities]
        avg_score = sum(comp.compatibility_score for comp in diet_compatibilities) / len(diet_compatibilities) if diet_compatibilities else 0
        
        # Determine overall recommendation
        if avg_score >= 70:
            overall = "Recommended"
        elif avg_score >= 40:
            overall = "Caution"
        else:
            overall = "Not Recommended"
            
        # For simplicity, just use the first diet compatibility's recommendations
        reason = diet_compatibilities[0].recommendations if diet_compatibilities else "No diet analysis available"
        
        # Get alternatives
        alternatives = await self._get_alternatives(product, diet_types)
        
        return DietAnalysisResult(
            product=product,
            compatibility=diet_compatibilities,
            overall_recommendation=overall,
            recommendation_reason=reason,
            alternatives=alternatives
        )
    
    async def _get_alternatives(self, product: FoodProduct, diet_types: List[str]) -> List[str]:
        """
        Get alternative product suggestions
        """
        diet_types_str = ", ".join(diet_types)
        
        prompt = f"""
        Please suggest 3-5 healthier alternatives to the following food product that would be more compatible with these diets: {diet_types_str}
        
        Product: {product.name}
        Ingredients: {product.ingredients_text or ", ".join(product.ingredients_list or [])}
        
        Format your response as a JSON array of strings, each being a recommended alternative product.
        """
        
        try:
            result = await self._query_perplexity(prompt)
            alternatives = self._parse_alternatives_response(result)
            return alternatives[:5]  # Limit to 5 alternatives
        except Exception as e:
            logger.error(f"Error getting alternatives: {e}")
            # Return test alternatives
            return ["Sample alternative product 1", "Sample alternative product 2", "Sample alternative product 3"]
    
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
        diet_types = ", ".join(user_preferences.diet_type or ["balanced"])
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
        3. recommendation_reason: A brief, one-sentence reason for the recommendation
        4. nutrition_components: Array of important nutritional components, each with:
           - name: The name of the nutrient
           - value: Amount per {product.nutrition_facts.per_quantity if product.nutrition_facts else "100g"}
           - health_rating: Either "healthy", "moderate", or "unhealthy"
           - reason: Brief explanation of health impact
        5. key_ingredients: Array of notable non-additive ingredients that have significant health impacts, each with:
           - name: Ingredient name
           - description: Brief description
           - health_impact: How it affects health
        6. additives: Array of food additives (E-numbers, preservatives, colorings, emulsifiers, etc.) IDENTIFIED FROM THE INGREDIENTS LIST, each with:
           - code: Additive code (like E330 or chemical name)
           - name: Common name
           - safety_level: "Safe", "Caution", "Controversial", or "Avoid"
           - description: What it's used for
           - potential_effects: Health effects
           - source: Information source
        7. sources: Array of URL references to academic or authoritative sources
        
        IMPORTANT: You must analyze the ingredients list and identify ANY food additives mentioned (such as e442, e476, citric acid, tocopherol, emulsifiers, etc.). Each identified additive should be included in the "additives" array with its details.
        
        Base your analysis on scientific evidence and prioritize academic references. Consider the user's health profile when determining recommendations.
        Return ONLY the JSON response without additional text.
        """
        
        try:
            result = await self._query_perplexity(prompt, model="sonar-pro")
            return self._parse_comprehensive_analysis(result)
        except Exception as e:
            logger.error(f"Error in comprehensive analysis: {str(e)}")
            # Return fallback data for testing
            return ProductAnalysis(
                health_score=50,
                recommendation="Caution",
                recommendation_reason="Analysis failed, using default recommendation",
                nutrition_components=[
                    NutritionComponent(
                        name="Sugar",
                        value="58.5g/100g",
                        health_rating="unhealthy",
                        reason="Very high sugar content"
                    ),
                    NutritionComponent(
                        name="Fat",
                        value="27.5g/100g",
                        health_rating="moderate",
                        reason="Moderate to high fat content"
                    )
                ],
                key_ingredients=[
                    KeyIngredient(
                        name="Cocoa",
                        description="Main ingredient in chocolate",
                        health_impact="Contains antioxidants, may have heart health benefits in moderate amounts"
                    ),
                    KeyIngredient(
                        name="Sugar",
                        description="Primary sweetener",
                        health_impact="High amounts can contribute to obesity and diabetes"
                    )
                ],
                additives=[
                    Additive(
                        code="E442",
                        name="Ammonium phosphatides",
                        safety_level="Caution",
                        description="Emulsifier used in chocolate products",
                        potential_effects="Generally recognized as safe, but some people may experience digestive issues",
                        source="European Food Safety Authority"
                    ),
                    Additive(
                        code="E476",
                        name="Polyglycerol polyricinoleate",
                        safety_level="Caution",
                        description="Emulsifier used in chocolate manufacturing",
                        potential_effects="May cause digestive discomfort in sensitive individuals",
                        source="FDA"
                    )
                ],
                sources=["https://www.efsa.europa.eu/", "https://www.fda.gov/"]
            )
    
    def _parse_comprehensive_analysis(self, response: str) -> ProductAnalysis:
        """
        Parse the comprehensive analysis response from Perplexity
        """
        try:
            # Extract JSON if it's wrapped in text
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                
                # Parse nutrition components
                nutrition_components = []
                for comp in data.get("nutrition_components", []):
                    nutrition_components.append(
                        NutritionComponent(
                            name=comp.get("name", ""),
                            value=comp.get("value", ""),
                            health_rating=comp.get("health_rating", ""),
                            reason=comp.get("reason", "")
                        )
                    )
                
                # Parse key ingredients
                key_ingredients = []
                for ing in data.get("key_ingredients", []):
                    key_ingredients.append(
                        KeyIngredient(
                            name=ing.get("name", ""),
                            description=ing.get("description", ""),
                            health_impact=ing.get("health_impact", "")
                        )
                    )
                
                # Parse additives
                additives = []
                for add in data.get("additives", []):
                    additives.append(
                        Additive(
                            code=add.get("code", ""),
                            name=add.get("name", ""),
                            safety_level=add.get("safety_level", "Unknown"),
                            description=add.get("description", ""),
                            potential_effects=add.get("potential_effects", ""),
                            source=add.get("source", "")
                        )
                    )
                
                return ProductAnalysis(
                    health_score=data.get("health_score", 50),
                    recommendation=data.get("recommendation", "Caution"),
                    recommendation_reason=data.get("recommendation_reason", "Insufficient data for analysis"),
                    nutrition_components=nutrition_components,
                    key_ingredients=key_ingredients,
                    additives=additives,
                    sources=data.get("sources", [])
                )
            else:
                logger.warning("No valid JSON object found in comprehensive analysis response")
                return ProductAnalysis(
                    health_score=0,
                    recommendation="Not recommended",
                    recommendation_reason="Analysis failed - no valid data",
                    nutrition_components=[],
                    key_ingredients=[],
                    additives=[]
                )
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse comprehensive analysis JSON: {e}")
            return ProductAnalysis(
                health_score=0,
                recommendation="Not recommended",
                recommendation_reason="Analysis failed - JSON parsing error",
                nutrition_components=[],
                key_ingredients=[],
                additives=[]
            )
        except Exception as e:
            logger.error(f"Error parsing comprehensive analysis: {e}")
            return ProductAnalysis(
                health_score=0,
                recommendation="Not recommended",
                recommendation_reason=f"Analysis error: {str(e)}",
                nutrition_components=[],
                key_ingredients=[],
                additives=[]
            )
    
    async def _query_perplexity(self, prompt: str, model: str = "sonar-pro") -> str:
        """
        Query the Perplexity Sonar API
        """
        if not self.api_key:
            logger.error("Missing Perplexity API key")
            raise ValueError("Missing Perplexity API key")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Updated payload format according to Perplexity API specifications
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a food science and nutritional expert that provides accurate, science-based analysis of food products."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2  # Lower temperature for more consistent outputs
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions", 
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                # Enhanced error logging
                if response.status_code != 200:
                    error_detail = f"Status: {response.status_code}, Response: {response.text}"
                    logger.error(f"Perplexity API error: {error_detail}")
                    raise httpx.HTTPError(f"HTTP error {response.status_code}: {response.text}")
                
                result = response.json()
                
                return result["choices"][0]["message"]["content"]
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred: {e}")
            raise e
        except Exception as e:
            logger.error(f"Error querying Perplexity: {e}")
            raise e
    
    def _parse_additives_response(self, response: str) -> List[Additive]:
        """
        Parse additives from Perplexity API response
        """
        try:
            # Extract JSON if it's wrapped in text
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                additives_data = json.loads(json_str)
                
                additives = []
                for item in additives_data:
                    additive = Additive(
                        code=item.get("code", ""),
                        name=item.get("common_name", ""),
                        safety_level=item.get("safety_level", "Unknown"),
                        description=item.get("description", ""),
                        potential_effects=item.get("potential_health_effects", ""),
                        source=item.get("source", "")
                    )
                    additives.append(additive)
                
                return additives
            else:
                logger.warning("No valid JSON array found in response")
                return []
        except json.JSONDecodeError:
            logger.error("Failed to parse additives JSON")
            return []
        except Exception as e:
            logger.error(f"Error parsing additives: {e}")
            return []
    
    def _parse_diet_compatibility_response(self, response: str, diet_type: str) -> DietCompatibility:
        """
        Parse diet compatibility from Perplexity API response
        """
        try:
            # Extract JSON if it's wrapped in text
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                
                compatibility = DietCompatibility(
                    diet_type=diet_type,
                    compatibility_score=float(data.get("compatibility_score", 0)),
                    incompatible_ingredients=data.get("incompatible_ingredients", []),
                    recommendations=data.get("recommendations", "No specific recommendations")
                )
                
                return compatibility
            else:
                logger.warning("No valid JSON object found in response")
                return DietCompatibility(
                    diet_type=diet_type,
                    compatibility_score=0,
                    incompatible_ingredients=["Unknown"],
                    recommendations="Failed to analyze compatibility"
                )
        except json.JSONDecodeError:
            logger.error("Failed to parse diet compatibility JSON")
            return DietCompatibility(
                diet_type=diet_type,
                compatibility_score=0,
                incompatible_ingredients=["Error in analysis"],
                recommendations="Failed to analyze compatibility"
            )
        except Exception as e:
            logger.error(f"Error parsing diet compatibility: {e}")
            return DietCompatibility(
                diet_type=diet_type,
                compatibility_score=0,
                incompatible_ingredients=["Error"],
                recommendations=f"Error: {str(e)}"
            )
    
    def _parse_alternatives_response(self, response: str) -> List[str]:
        """
        Parse alternatives from Perplexity API response
        """
        try:
            # Extract JSON if it's wrapped in text
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                alternatives = json.loads(json_str)
                return alternatives
            else:
                # Fallback: try to extract suggestions from text
                lines = response.split('\n')
                alternatives = []
                for line in lines:
                    if '-' in line or '•' in line or '*' in line:
                        # It might be a list item
                        alt = line.split('-')[-1].split('•')[-1].split('*')[-1].strip()
                        if alt:
                            alternatives.append(alt)
                
                return alternatives if alternatives else ["No alternatives found"]
        except json.JSONDecodeError:
            logger.error("Failed to parse alternatives JSON")
            return ["Error parsing alternatives"]
        except Exception as e:
            logger.error(f"Error parsing alternatives: {e}")
            return ["Error fetching alternatives"]

perplexity_service = PerplexitySonarService() 