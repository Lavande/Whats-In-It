import { Product, AnalysisResult, UserPreferences, ComprehensiveAnalysisRequest, ApiError } from '@/types';

class ApiService {
  private readonly baseUrl = 'https://api.whats-in-it.org';
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Request to: ${url}`);
    if (config.body) {
      console.log('Request body:', config.body);
    }

    try {
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response:', errorData);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.detail) {
            if (Array.isArray(parsedError.detail)) {
              errorMessage = parsedError.detail.map((err: any) => err.msg).join(', ');
            } else if (typeof parsedError.detail === 'string') {
              errorMessage = parsedError.detail;
            }
          }
        } catch {
          // Use the raw error text if it's not JSON
          if (errorData) {
            errorMessage = errorData;
          }
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        
        throw apiError;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to server. Please check your connection and try again.');
      }
      
      // Re-throw ApiError as-is
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      
      throw new Error(`An unexpected error occurred: ${error}`);
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 45000); // 45 second timeout
    
    try {
      const product = await this.request<Product>(
        `/api/v1/product/${barcode}`,
        { signal: timeoutController.signal }
      );
      
      return product;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Connection timed out. The server is taking too long to respond.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getComprehensiveAnalysis(
    product: Product, 
    preferences: UserPreferences
  ): Promise<AnalysisResult> {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 90000); // 90 second timeout for analysis
    
    try {
      const requestBody: ComprehensiveAnalysisRequest = {
        product: {
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          image_url: product.image_url,
          ingredients_text: product.ingredients_text,
          ingredients_list: product.ingredients_list,
          nutrition_facts: product.nutrition_facts,
        },
        user_preferences: {
          diet_type: preferences.dietType,
          allergies: preferences.allergies,
          avoid_ingredients: preferences.avoidIngredients,
          health_concerns: {
            sugar: preferences.sugarConcern,
            salt: preferences.saltConcern,
            fat: preferences.fatConcern,
          },
        },
      };

      const analysis = await this.request<AnalysisResult>(
        '/api/v1/analyze-comprehensive',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          signal: timeoutController.signal,
        }
      );

      return analysis;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Analysis timed out. The server is taking too long to complete the analysis.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Health check method
  async checkHealth(): Promise<{ status: string }> {
    try {
      return await this.request('/health');
    } catch (error) {
      throw new Error('API health check failed');
    }
  }

  // Format error messages for display
  static formatErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as ApiError;
      const message = apiError.message;
      
      // Simplify common error messages
      if (message.includes('Failed to get analysis')) {
        if (message.includes('422')) {
          return 'The server could not process the request. Please check your product information and try again.';
        } else if (message.includes('404')) {
          return 'The analysis service could not be found. Please try again later.';
        } else if (message.includes('500')) {
          return 'The server encountered an error. Please try again later.';
        }
      }
      
      if (message.includes('Network error')) {
        return 'Cannot connect to the server. Please check your internet connection and try again.';
      }
      
      if (message.includes('timed out') || message.includes('timeout')) {
        return 'The request took too long to complete. Please try again.';
      }
      
      return message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}

// Create a singleton instance
export const apiService = new ApiService();
export default ApiService;