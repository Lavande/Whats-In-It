class Product {
  final String barcode;
  final String name;
  final String brand;
  final String? imageUrl;
  final String ingredientsText;
  final List<String> ingredientsList;
  final Map<String, dynamic> nutritionFacts;

  Product({
    required this.barcode,
    required this.name,
    required this.brand,
    this.imageUrl,
    required this.ingredientsText,
    required this.ingredientsList,
    required this.nutritionFacts,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      barcode: json['barcode'] ?? '',
      name: json['name'] ?? 'Unknown Product',
      brand: json['brand'] ?? 'Unknown Brand',
      imageUrl: json['image_url'],
      ingredientsText: json['ingredients_text'] ?? '',
      ingredientsList: List<String>.from(json['ingredients_list'] ?? []),
      nutritionFacts: json['nutrition_facts'] ?? {},
    );
  }
  
  // Get a list of ingredients for display
  List<String> get ingredients {
    if (ingredientsList.isNotEmpty) {
      return ingredientsList;
    } else if (ingredientsText.isNotEmpty) {
      return ingredientsText.split(',').map((e) => e.trim()).toList();
    }
    return [];
  }
  
  // Get a map of nutriments for API requests
  Map<String, dynamic> get nutriments {
    // Convert nutrition_facts to nutriments format if needed
    return nutritionFacts;
  }
} 