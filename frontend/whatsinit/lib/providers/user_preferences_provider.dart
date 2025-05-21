import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_preferences.dart';

class UserPreferencesProvider with ChangeNotifier {
  UserPreferences _userPreferences = UserPreferences();
  bool _onboardingCompleted = false;

  UserPreferences get userPreferences => _userPreferences;
  bool get onboardingCompleted => _onboardingCompleted;

  // Initialize provider by loading from SharedPreferences
  Future<void> initialize() async {
    await _loadFromPrefs();
  }

  // Save current preferences and onboarding status
  Future<void> savePreferences(UserPreferences preferences) async {
    _userPreferences = preferences;
    await _saveToPrefs();
    notifyListeners();
  }

  // Mark onboarding as completed
  Future<void> completeOnboarding() async {
    _onboardingCompleted = true;
    await _saveToPrefs();
    notifyListeners();
  }

  // Reset onboarding (for testing/development)
  Future<void> resetOnboarding() async {
    _onboardingCompleted = false;
    await _saveToPrefs();
    notifyListeners();
  }

  // Load from SharedPreferences
  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Check if onboarding was completed
    _onboardingCompleted = prefs.getBool('onboardingCompleted') ?? false;
    
    // Load diet preferences
    final dietType = prefs.getStringList('dietType') ?? ['standard'];
    final allergies = prefs.getStringList('allergies') ?? [];
    final avoidIngredients = prefs.getStringList('avoidIngredients') ?? [];
    
    // Load health concerns
    final sugarConcern = prefs.getBool('sugarConcern') ?? false;
    final saltConcern = prefs.getBool('saltConcern') ?? false;
    final fatConcern = prefs.getBool('fatConcern') ?? false;
    
    _userPreferences = UserPreferences(
      dietType: dietType,
      allergies: allergies,
      avoidIngredients: avoidIngredients,
      sugarConcern: sugarConcern,
      saltConcern: saltConcern,
      fatConcern: fatConcern,
    );
    
    notifyListeners();
  }

  // Save to SharedPreferences
  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Save onboarding status
    await prefs.setBool('onboardingCompleted', _onboardingCompleted);
    
    // Save diet preferences
    await prefs.setStringList('dietType', _userPreferences.dietType);
    await prefs.setStringList('allergies', _userPreferences.allergies);
    await prefs.setStringList('avoidIngredients', _userPreferences.avoidIngredients);
    
    // Save health concerns
    await prefs.setBool('sugarConcern', _userPreferences.sugarConcern);
    await prefs.setBool('saltConcern', _userPreferences.saltConcern);
    await prefs.setBool('fatConcern', _userPreferences.fatConcern);
  }
} 