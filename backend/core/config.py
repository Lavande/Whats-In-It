import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API configurations
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "What's In It"
    
    # Open Food Facts API
    OPENFOODFACTS_API_URL: str = "https://world.openfoodfacts.org/api/v2"
    OPENFOODFACTS_USER_AGENT: str = "WhatsInIt/0.1.0 (admin@5dimn.com)"
    
    # Perplexity Sonar API
    PERPLEXITY_API_KEY: str = os.getenv("PERPLEXITY_API_KEY", "")
    PERPLEXITY_API_URL: str = "https://api.perplexity.ai"
    
    # Cache configuration
    CACHE_EXPIRATION: int = 86400  # 24 hours in seconds
    
    class Config:
        case_sensitive = True

settings = Settings() 