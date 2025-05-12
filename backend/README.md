# What's In It - Backend

This is the backend API for the "What's In It" application, which helps users understand the ingredients, additives, and nutritional information of food products.

## Features

- Barcode scanning and product information retrieval via OpenFoodFacts API
- Food additive safety analysis using Perplexity Sonar API
- Diet compatibility analysis (keto, vegan, low-carb, etc.)
- Personalized dietary recommendations
- User preferences and history storage

## Technology Stack

- Python 3.8+
- FastAPI
- OpenFoodFacts API
- Perplexity Sonar API

## Setup

1. Clone the repository
2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example`:

```bash
# Create .env file
cp .env.example .env
```

4. Edit the `.env` file with your API keys:

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Running the API

Start the development server:

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

FastAPI automatically generates interactive API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Product Information

- `GET /api/v1/product/{barcode}` - Get product by barcode
- `GET /api/v1/product/{barcode}/additives` - Get product additives analysis

### Scan and Analysis

- `POST /api/v1/scan/{barcode}` - Complete scan workflow
- `POST /api/v1/analyze-diet-compatibility` - Analyze diet compatibility
- `POST /api/v1/analyze-additives` - Analyze additives in a product

### User Preferences and History

- `GET /api/v1/preferences` - Get user preferences
- `POST /api/v1/preferences` - Update user preferences
- `GET /api/v1/history` - Get scan history
- `DELETE /api/v1/history` - Clear scan history

## Data Storage

User preferences and scan history are stored locally in JSON files in the `data` directory. 