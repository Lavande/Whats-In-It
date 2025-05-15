class AnalysisResult {
  final Map<String, dynamic> summary;
  final Map<String, dynamic> nutritionAnalysis;
  final Map<String, dynamic> additiveAnalysis;
  final Map<String, dynamic> keyIngredientsAnalysis;
  final Map<String, dynamic> dietCompatibility;
  final Map<String, dynamic> allergenInfo;
  final List<Map<String, dynamic>> sources;

  AnalysisResult({
    required this.summary,
    required this.nutritionAnalysis,
    required this.additiveAnalysis,
    required this.keyIngredientsAnalysis,
    required this.dietCompatibility,
    required this.allergenInfo,
    required this.sources,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    try {
      // Create summary from health score and recommendation
      final Map<String, dynamic> summary = {
        'overall_score': json['health_score'] ?? 0,
        'recommendation': json['recommendation'] ?? 'No recommendation available',
        'recommendation_reason': json['recommendation_reason'] ?? '',
      };

      // Extract nutrition data
      final List<dynamic> nutritionComponents = json['nutrition_components'] ?? [];
      final Map<String, dynamic> nutritionAnalysis = {};
      
      for (var component in nutritionComponents) {
        nutritionAnalysis[component['name'] ?? 'Unknown'] = {
          'value': component['value'] ?? 'Not specified',
          'health_rating': component['health_rating'] ?? 'unknown',
          'reason': component['reason'] ?? '',
        };
      }

      // Extract additives
      final List<dynamic> additives = json['additives'] ?? [];
      final Map<String, dynamic> additiveAnalysis = {};
      
      for (var additive in additives) {
        additiveAnalysis[additive['name'] ?? 'Unknown'] = {
          'code': additive['code'] ?? '',
          'safety_level': additive['safety_level'] ?? 'Unknown',
          'description': additive['description'] ?? '',
          'potential_effects': additive['potential_effects'] ?? '',
        };
      }

      // Extract key ingredients (excluding additives)
      final List<dynamic> keyIngredients = json['key_ingredients'] ?? [];
      final Map<String, dynamic> keyIngredientsAnalysis = {};
      
      for (var ingredient in keyIngredients) {
        keyIngredientsAnalysis[ingredient['name'] ?? 'Unknown'] = {
          'description': ingredient['description'] ?? '',
          'health_impact': ingredient['health_impact'] ?? '',
        };
      }

      // Extract diet compatibility from recommendation reason
      final Map<String, dynamic> dietCompatibility = {
        'Compatibility': {
          'status': json['recommendation'] == 'not recommended' ? 'Not Compatible' : 'Compatible',
          'reason': json['recommendation_reason'] ?? '',
        }
      };

      // Extract sources
      final List<dynamic> rawSources = json['sources'] ?? [];
      final List<Map<String, dynamic>> sources = rawSources.map<Map<String, dynamic>>((source) {
        return {
          'title': source['title'] ?? 'Unknown source',
          'url': source['url'] ?? '',
        };
      }).toList();

      return AnalysisResult(
        summary: summary,
        nutritionAnalysis: nutritionAnalysis,
        additiveAnalysis: additiveAnalysis,
        keyIngredientsAnalysis: keyIngredientsAnalysis,
        dietCompatibility: dietCompatibility,
        allergenInfo: {}, // No allergen data in the current API response
        sources: sources,
      );
    } catch (e) {
      print('Error parsing analysis result: $e');
      // Return a default object with error information
      return AnalysisResult(
        summary: {
          'overall_score': 0,
          'recommendation': 'Error analyzing product',
          'recommendation_reason': 'There was an error analyzing this product: $e',
        },
        nutritionAnalysis: {},
        additiveAnalysis: {},
        keyIngredientsAnalysis: {},
        dietCompatibility: {},
        allergenInfo: {},
        sources: [],
      );
    }
  }

  // Get a simple overall rating from 0-100
  int getOverallRating() {
    try {
      return summary['overall_score'] ?? 0;
    } catch (e) {
      return 0; // Default rating if there's an error
    }
  }

  // Get the recommendation with reason
  String getRecommendation() {
    return summary['recommendation'] ?? 'No recommendation available';
  }
  
  String getRecommendationReason() {
    return summary['recommendation_reason'] ?? '';
  }
} 