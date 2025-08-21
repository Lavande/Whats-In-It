import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/analysis_result.dart';
import '../models/user_preferences.dart';

class ApiService {
  // In a real app, this would come from environment variables
  late String baseUrl;
  // Fixed backend URL
  static const String BACKEND_URL = 'https://api.whats-in-it.org';
  
  // Constructor that initializes the baseUrl
  ApiService() {
    baseUrl = BACKEND_URL;
  }
  
  
  
  
  // Get product information by barcode
  Future<Product> getProductByBarcode(String barcode) async {
    print('Attempting to connect to: $baseUrl/api/v1/product/$barcode');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/product/$barcode'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 45)); // Increased timeout from 30 to 45 seconds

      print('Response received - Status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        return Product.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to load product: ${response.statusCode} - ${response.body}');
      }
    } on SocketException catch (e) {
      print('Socket Exception: $e');
      throw Exception('Network error: Cannot connect to server. Please check your connection and try again.');
    } on TimeoutException catch (e) {
      print('Timeout Exception: $e');
      throw Exception('Connection timed out. The server is taking too long to respond.');
    } catch (e) {
      print('Generic Exception: $e');
      throw Exception('An unexpected error occurred: $e');
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

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/analyze-comprehensive'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      ).timeout(const Duration(seconds: 90)); // Increased timeout from 30 to 90 seconds for comprehensive analysis

      // Log the response for debugging
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        return AnalysisResult.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to get analysis: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error during analysis request: $e');
      throw Exception('Failed to complete analysis: $e');
    }
  }
} 