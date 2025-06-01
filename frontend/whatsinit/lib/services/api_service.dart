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
  // Online backend URL
  static const String ONLINE_BACKEND_URL = 'https://whats-in-it-backend.onrender.com';
  static const String LOCAL_BACKEND_URL = 'http://localhost:8000';
  static const String DEFAULT_LOCAL_IP = 'http://192.168.1.7:8000';
  
  // Track the currently active backend URL across instances
  static String _activeBaseUrl = ONLINE_BACKEND_URL;
  
  // Constructor that initializes the baseUrl
  ApiService() {
    baseUrl = _activeBaseUrl;
  }
  
  // Helper method to determine base URL based on platform
  static String _getBaseUrl() {
    // Default to online backend URL
    return ONLINE_BACKEND_URL;
  }
  
  // This is only called for non-web platforms
  static String _getPlatformSpecificUrl() {
    try {
      // Try different possible IP addresses
      return DEFAULT_LOCAL_IP;
    } catch (e) {
      // Fallback for any issues
      return DEFAULT_LOCAL_IP;
    }
  }
  
  // Test connection to server with different IP addresses
  Future<String> findWorkingServerUrl() async {
    // First test the current baseUrl to see if it works
    print('Testing current connection to: $baseUrl');
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 5));
      
      if (response.statusCode == 200) {
        print('SUCCESS: Current connection to $baseUrl is working');
        return baseUrl;
      }
    } catch (e) {
      print('FAILED: Current connection to $baseUrl failed: $e');
    }
    
    // If current URL doesn't work, then try the alternatives
    // List of potential IP patterns to try
    List<String> potentialIps = [
      ONLINE_BACKEND_URL,    // Online deployed backend
      DEFAULT_LOCAL_IP,      // Original IP
      'http://192.168.0.7:8000',   // Alternative subnet
      'http://10.0.0.7:8000',      // Alternative network
      'http://172.20.10.7:8000',   // Hotspot network
      LOCAL_BACKEND_URL,     // localhost (for emulators)
      'http://127.0.0.1:8000',     // localhost IP
      'http://198.18.0.1:8000',    // Other IP from your Mac
      'http://169.254.66.70:8000', // Link-local IP
    ];
    
    for (String url in potentialIps) {
      // Skip testing the current URL again
      if (url == baseUrl) continue;
      
      print('Testing connection to: $url');
      try {
        final response = await http.get(
          Uri.parse('$url/'),
          headers: {'Content-Type': 'application/json'},
        ).timeout(const Duration(seconds: 5));
        
        if (response.statusCode == 200) {
          print('SUCCESS: Connection to $url succeeded');
          // Don't automatically update baseUrl anymore
          // baseUrl = url;
          // _activeBaseUrl = url; // Save to static variable
          return url; // Just return the working URL but don't switch to it
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
    // Only add port if not already present and not for the online backend
    if (!url.contains(':') && !url.contains('render.com')) {
      url = '$url:8000';
    }
    baseUrl = url;
    _activeBaseUrl = url; // Save to static variable
    print('Set custom base URL to: $baseUrl');
  }

  // Switch to online backend
  void useOnlineBackend() {
    baseUrl = ONLINE_BACKEND_URL;
    _activeBaseUrl = ONLINE_BACKEND_URL; // Save to static variable
    print('Switched to online backend: $baseUrl');
  }

  // Switch to local backend
  void useLocalBackend() {
    baseUrl = LOCAL_BACKEND_URL;
    _activeBaseUrl = LOCAL_BACKEND_URL; // Save to static variable
    print('Switched to local backend: $baseUrl');
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