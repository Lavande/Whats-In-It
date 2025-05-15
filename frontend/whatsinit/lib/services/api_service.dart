import 'dart:convert';
import 'dart:io' show Platform;
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/analysis_result.dart';
import '../models/user_preferences.dart';

class ApiService {
  // In a real app, this would come from environment variables
  final String baseUrl = Platform.isAndroid 
      ? 'http://10.0.2.2:8000'  // Android emulator localhost 
      : 'http://localhost:8000'; // iOS simulator localhost
  
  // Get product information by barcode
  Future<Product> getProductByBarcode(String barcode) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/product/$barcode'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return Product.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load product: ${response.statusCode} - ${response.body}');
    }
  }

  // Get comprehensive analysis based on product and user preferences
  Future<AnalysisResult> getComprehensiveAnalysis(
      Product product, UserPreferences preferences) async {
    // Combine product data with user preferences for the request
    Map<String, dynamic> requestBody = {
      'product': {
        'barcode': product.barcode,
        'name': product.name,
        'brands': product.brand,
        'ingredients_text': product.ingredientsText,
        'ingredients_list': product.ingredientsList,
        'nutrition_facts': product.nutritionFacts,
      },
      'user_preferences': {
        'diet_type': preferences.dietType,
        'allergies': preferences.allergies,
        'avoid_ingredients': preferences.avoidIngredients,
        'health_concerns': {
          'sugar': preferences.sugarConcern,
          'salt': preferences.saltConcern,
          'fat': preferences.fatConcern,
        }
      }
    };

    // Log the request for debugging
    print('API Request to: $baseUrl/api/v1/analyze-comprehensive');
    print('Request body: ${json.encode(requestBody)}');

    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/analyze-comprehensive'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(requestBody),
    );

    // Log the response for debugging
    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');

    if (response.statusCode == 200) {
      return AnalysisResult.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to get analysis: ${response.statusCode} - ${response.body}');
    }
  }
} 