class UserPreferences {
  final List<String> dietType;
  final List<String> allergies;
  final List<String> avoidIngredients;
  final bool sugarConcern;
  final bool saltConcern;
  final bool fatConcern;

  UserPreferences({
    this.dietType = const ['standard'],
    this.allergies = const [],
    this.avoidIngredients = const [],
    this.sugarConcern = false,
    this.saltConcern = false,
    this.fatConcern = false,
  });

  // Mock data for development
  factory UserPreferences.mockData() {
    return UserPreferences(
      dietType: ['ketogenic'],
      allergies: ['peanuts', 'shellfish'],
      avoidIngredients: ['artificial colors', 'MSG'],
      sugarConcern: true,
      saltConcern: true,
      fatConcern: false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_preferences': {
        'diet_type': dietType,
        'allergies': allergies,
        'avoid_ingredients': avoidIngredients,
        'health_concerns': {
          'sugar': sugarConcern,
          'salt': saltConcern,
          'fat': fatConcern,
        }
      }
    };
  }
} 