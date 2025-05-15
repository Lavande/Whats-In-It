import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../models/analysis_result.dart';
import '../models/user_preferences.dart';
import '../services/api_service.dart';
import '../services/barcode_service.dart';

enum LoadingState { idle, loading, error, success }

class ProductProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final BarcodeService _barcodeService = BarcodeService();
  
  // State
  Product? _product;
  AnalysisResult? _analysisResult;
  String _errorMessage = '';
  LoadingState _productLoadingState = LoadingState.idle;
  LoadingState _analysisLoadingState = LoadingState.idle;
  
  // Mock user preferences - in a real app, this would be stored in preferences
  UserPreferences _userPreferences = UserPreferences.mockData();

  // Getters
  Product? get product => _product;
  AnalysisResult? get analysisResult => _analysisResult;
  String get errorMessage => _errorMessage;
  LoadingState get productLoadingState => _productLoadingState;
  LoadingState get analysisLoadingState => _analysisLoadingState;
  UserPreferences get userPreferences => _userPreferences;
  
  // Check if we can proceed to analysis (product must be loaded)
  bool get canAnalyze => _product != null;

  // Scan barcode and load product information
  Future<void> scanAndLoadProduct() async {
    try {
      final barcode = await _barcodeService.scanBarcode();
      if (barcode != null) {
        await loadProductByBarcode(barcode);
      }
    } catch (e) {
      _setError('Failed to scan barcode: ${e.toString()}');
    }
  }

  // Load product by barcode
  Future<void> loadProductByBarcode(String barcode) async {
    _setProductLoading();
    
    try {
      final product = await _apiService.getProductByBarcode(barcode);
      _setProductLoaded(product);
    } catch (e) {
      _setError('Failed to load product: ${e.toString()}');
    }
  }

  // Get comprehensive analysis
  Future<void> analyzeProduct() async {
    if (_product == null) {
      _setError('Cannot analyze: No product loaded');
      return;
    }
    
    _setAnalysisLoading();
    
    try {
      print("Product data being sent: Barcode: ${_product!.barcode}, Name: ${_product!.name}");
      print("Ingredients: ${_product!.ingredients.join(', ')}");
      print("User preferences: Diet type: ${_userPreferences.dietType}");
      
      final analysisResult = await _apiService.getComprehensiveAnalysis(
        _product!,
        _userPreferences,
      );
      _setAnalysisLoaded(analysisResult);
    } catch (e) {
      print("Analysis error: ${e.toString()}");
      _setError('Failed to analyze product: ${e.toString()}');
    }
  }

  // Update user preferences
  void updateUserPreferences(UserPreferences preferences) {
    _userPreferences = preferences;
    notifyListeners();
    
    // If we have a product loaded, re-analyze with new preferences
    if (_product != null && _analysisResult != null) {
      analyzeProduct();
    }
  }

  // Reset everything
  void reset() {
    _product = null;
    _analysisResult = null;
    _errorMessage = '';
    _productLoadingState = LoadingState.idle;
    _analysisLoadingState = LoadingState.idle;
    notifyListeners();
  }

  // Private helper methods
  void _setProductLoading() {
    _productLoadingState = LoadingState.loading;
    _errorMessage = '';
    notifyListeners();
  }

  void _setProductLoaded(Product product) {
    _product = product;
    _productLoadingState = LoadingState.success;
    notifyListeners();
  }

  void _setAnalysisLoading() {
    _analysisLoadingState = LoadingState.loading;
    _errorMessage = '';
    notifyListeners();
  }

  void _setAnalysisLoaded(AnalysisResult result) {
    _analysisResult = result;
    _analysisLoadingState = LoadingState.success;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    _productLoadingState = LoadingState.error;
    _analysisLoadingState = LoadingState.error;
    notifyListeners();
  }
} 