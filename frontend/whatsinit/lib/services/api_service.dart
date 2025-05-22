import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/analysis_result.dart';
import '../models/user_preferences.dart';

class ApiService {
  // In a real app, this would come from environment variables
  late String baseUrl;
  
  // Constructor that initializes the baseUrl
  ApiService() {
    baseUrl = _getBaseUrl();
  }
  
  // Helper method to determine base URL based on platform
  static String _getBaseUrl() {
    if (kIsWeb) {
      // For web platform
      return 'http://localhost:8000';
    } else {
      // For native platforms, import dart:io conditionally
      return _getPlatformSpecificUrl();
    }
  }
  
  // This is only called for non-web platforms
  static String _getPlatformSpecificUrl() {
    try {
      // Try different possible IP addresses
      return 'http://192.168.1.7:8000';
    } catch (e) {
      // Fallback for any issues
      return 'http://192.168.1.7:8000';
    }
  }
  
  // Test connection to server with different IP addresses
  Future<String> findWorkingServerUrl() async {
    // List of potential IP patterns to try
    List<String> potentialIps = [
      'http://192.168.1.7:8000',   // Original IP
      'http://192.168.0.7:8000',   // Alternative subnet
      'http://10.0.0.7:8000',      // Alternative network
      'http://172.20.10.7:8000',   // Hotspot network
      'http://localhost:8000',     // localhost (for emulators)
      'http://127.0.0.1:8000',     // localhost IP
      'http://198.18.0.1:8000',    // Other IP from your Mac
      'http://169.254.66.70:8000', // Link-local IP
    ];
    
    for (String url in potentialIps) {
      print('Testing connection to: $url');
      try {
        final response = await http.get(
          Uri.parse('$url/'),
          headers: {'Content-Type': 'application/json'},
        ).timeout(const Duration(seconds: 5));
        
        if (response.statusCode == 200) {
          print('SUCCESS: Connection to $url succeeded');
          // 立即更新baseUrl为当前成功的URL
          baseUrl = url;
          return url;
        }
      } catch (e) {
        print('FAILED: Connection to $url failed: $e');
      }
    }
    return 'No working connection found';
  }
  
  // Set a custom base URL manually
  void setCustomBaseUrl(String url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://$url';
    }
    if (!url.contains(':8000')) {
      url = '$url:8000';
    }
    baseUrl = url;
    print('Set custom base URL to: $baseUrl');
  }
  
  // Get product information by barcode
  Future<Product> getProductByBarcode(String barcode) async {
    print('Attempting to connect to: $baseUrl/api/v1/product/$barcode');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/product/$barcode'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 30)); // Add longer timeout

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
      ).timeout(const Duration(seconds: 30)); // Add longer timeout

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