# What's In It - Backend

This is the backend API for the "What's In It" application, which helps users understand the ingredients, additives, and nutritional information of food products.

## Features

- Barcode scanning and product information retrieval via OpenFoodFacts API
- Food additive safety analysis using Perplexity Sonar API
- Personalized dietary recommendations

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

### Analysis

- `POST /api/v1/analyze-comprehensive` - Comprehensive product analysis based on user preferences

## Data Storage

Product information is cached temporarily to reduce API calls. 