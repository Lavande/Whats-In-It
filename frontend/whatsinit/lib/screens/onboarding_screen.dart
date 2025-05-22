import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_preferences_provider.dart';
import '../models/user_preferences.dart';
import '../widgets/onboarding_widgets.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _pageViewCurrentPage = 0;
  bool _initialWelcomeShown = false;

  String _selectedDietStyle = 'standard';
  final List<String> _selectedAllergies = [];
  final List<String> _selectedHealthFocus = [];
  
  @override
  Widget build(BuildContext context) {
    if (!_initialWelcomeShown) {
      return Scaffold(
        body: SafeArea(
          child: _buildWelcomeStepContent(() {
            setState(() {
              _initialWelcomeShown = true;
            });
          }),
        ),
      );
    } else {
      final pageViewChildren = [
        _buildDietStyleStep(),
        _buildAllergiesStep(),
        _buildHealthFocusStep(),
        _buildCompletionStep(),
      ];

      return Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Row(
                  children: [
                    if (_pageViewCurrentPage > 0)
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: () {
                          _pageController.previousPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        },
                      )
                    else
                      const SizedBox(width: 48.0),
                    const Spacer(),
                    if (_pageViewCurrentPage < pageViewChildren.length - 1)
                      TextButton(
                        onPressed: _completeOnboarding,
                        child: const Text('Skip'),
                      )
                    else
                      const SizedBox(width: 58.0),
                  ],
                ),
              ),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  onPageChanged: (page) {
                    setState(() {
                      _pageViewCurrentPage = page;
                    });
                  },
                  children: pageViewChildren,
                ),
              ),
              if (_pageViewCurrentPage < pageViewChildren.length - 1)
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: LinearProgressIndicator(
                    value: (_pageViewCurrentPage + 1.0) / (pageViewChildren.length - 1.0),
                    backgroundColor: Colors.grey[200],
                    color: Theme.of(context).colorScheme.primary,
                    minHeight: 6,
                  ),
                ),
            ],
          ),
        ),
      );
    }
  }

  Widget _buildWelcomeStepContent(VoidCallback onGetStartedPressed) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Spacer(flex: 2),
          Text(
            "Hi 👋",
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Let's tailor your experience to fit your health goals.",
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 3),
          OnboardingButton(
            label: "Get Started",
            onPressed: onGetStartedPressed,
          ),
          const Spacer(flex: 1),
        ],
      ),
    );
  }

  Widget _buildDietStyleStep() {
    final dietStyles = [
      {
        'id': 'standard',
        'title': 'No Preference',
        'description': 'Standard diet with no specific restrictions',
        'icon': Icons.restaurant,
      },
      {
        'id': 'ketogenic',
        'title': 'Keto',
        'description': 'High-fat, low-carb diet',
        'icon': Icons.egg_alt,
      },
      {
        'id': 'vegan',
        'title': 'Vegan',
        'description': 'Excludes all animal products',
        'icon': Icons.spa,
      },
      {
        'id': 'low_carb',
        'title': 'Low-Carb',
        'description': 'Reduced carbohydrate intake',
        'icon': Icons.restaurant_menu,
      },
      {
        'id': 'mediterranean',
        'title': 'Mediterranean',
        'description': 'Rich in fruits, vegetables, whole grains, and olive oil',
        'icon': Icons.local_florist,
      },
    ];

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24.0, 0, 24.0, 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const OnboardingTitle(title: "What's your diet style?"),
            ...dietStyles.map((diet) => PreferenceCard(
              title: diet['title'] as String,
              description: diet['description'] as String,
              icon: diet['icon'] as IconData,
              isSelected: _selectedDietStyle == diet['id'],
              onTap: () {
                setState(() {
                  _selectedDietStyle = diet['id'] as String;
                });
              },
            )).toList(),
            const SizedBox(height: 24),
            OnboardingButton(
              label: "Next",
              onPressed: () {
                _pageController.nextPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAllergiesStep() {
    final commonAllergies = [
      'Lactose', 'Gluten', 'Nuts', 'Peanuts', 'Eggs', 'Seafood', 
      'Soy', 'Food Coloring', 'Corn', 'Shellfish', 'Wheat', 'MSG'
    ];

    final TextEditingController allergyController = TextEditingController();

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24.0, 0, 24.0, 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const OnboardingTitle(title: "Any allergies or intolerances?"),
            TextField(
              controller: allergyController,
              decoration: InputDecoration(
                hintText: 'Type a specific allergy...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  onPressed: () {
                    if (allergyController.text.isNotEmpty &&
                        !_selectedAllergies.contains(allergyController.text)) {
                      setState(() {
                        _selectedAllergies.add(allergyController.text);
                        allergyController.clear();
                      });
                    }
                  },
                ),
              ),
              onSubmitted: (value) {
                if (value.isNotEmpty && !_selectedAllergies.contains(value)) {
                  setState(() {
                    _selectedAllergies.add(value);
                    allergyController.clear();
                  });
                }
              },
            ),
            const SizedBox(height: 24),
            const Text(
              'Common Allergies & Intolerances',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8.0,
              runSpacing: 4.0,
              children: commonAllergies.map((allergy) => SelectableChip(
                label: allergy,
                isSelected: _selectedAllergies.contains(allergy),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedAllergies.add(allergy);
                    } else {
                      _selectedAllergies.remove(allergy);
                    }
                  });
                },
              )).toList(),
            ),
            if (_selectedAllergies.isNotEmpty) ...[
              const SizedBox(height: 24),
              const Text(
                'Your Selected Allergies',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8.0,
                runSpacing: 4.0,
                children: _selectedAllergies.map((allergy) => Chip(
                  label: Text(allergy),
                  deleteIcon: const Icon(Icons.close, size: 18),
                  onDeleted: () {
                    setState(() {
                      _selectedAllergies.remove(allergy);
                    });
                  },
                )).toList(),
              ),
            ],
            const SizedBox(height: 24),
            OnboardingButton(
              label: "Next",
              onPressed: () {
                _pageController.nextPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthFocusStep() {
    final healthFocus = [
      {
        'id': 'sugar',
        'title': 'Sugar Concern',
        'description': 'Managing blood sugar or reducing sugar intake',
        'icon': Icons.monitor_heart_outlined,
      },
      {
        'id': 'salt',
        'title': 'Salt Concern',
        'description': 'Managing blood pressure or reducing sodium intake',
        'icon': Icons.restaurant_menu_outlined,
      },
      {
        'id': 'cholesterol',
        'title': 'High Cholesterol',
        'description': 'Managing or reducing cholesterol levels',
        'icon': Icons.bloodtype_outlined,
      },
      {
        'id': 'weight_loss',
        'title': 'Weight Loss',
        'description': 'Focus on calories and portion control',
        'icon': Icons.fitness_center_outlined,
      },
      {
        'id': 'muscle_gain',
        'title': 'Muscle Gain',
        'description': 'Focus on protein and nutrition for muscle building',
        'icon': Icons.sports_gymnastics_outlined,
      },
      {
        'id': 'digestive',
        'title': 'Digestive Sensitivity',
        'description': 'Gentle on the digestive system',
        'icon': Icons.healing_outlined,
      },
    ];

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24.0, 0, 24.0, 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const OnboardingTitle(title: "Any health focus areas?"),
            const Padding(
              padding: EdgeInsets.only(bottom: 16.0),
              child: Text(
                'Select all that apply to you.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ),
            ...healthFocus.map((focus) => PreferenceCard(
              title: focus['title'] as String,
              description: focus['description'] as String,
              icon: focus['icon'] as IconData,
              isSelected: _selectedHealthFocus.contains(focus['id']),
              onTap: () {
                setState(() {
                  if (_selectedHealthFocus.contains(focus['id'])) {
                    _selectedHealthFocus.remove(focus['id']);
                  } else {
                    _selectedHealthFocus.add(focus['id'] as String);
                  }
                });
              },
            )).toList(),
            const SizedBox(height: 24),
            OnboardingButton(
              label: "Finish Setup",
              onPressed: () {
                _pageController.nextPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompletionStep() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Spacer(flex: 2),
          Icon(
            Icons.check_circle_outline,
            size: 80,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 32),
          Text(
            "You're all set 🎉",
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "From now on, all suggestions will be tailored to your preferences.",
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 3),
          OnboardingButton(
            label: "Start Scanning",
            onPressed: _completeOnboarding,
          ),
          const Spacer(flex: 1),
        ],
      ),
    );
  }

  void _completeOnboarding() {
    final userPrefs = UserPreferences(
      dietType: [_selectedDietStyle],
      allergies: _selectedAllergies,
      avoidIngredients: [], // Default to empty list
      sugarConcern: _selectedHealthFocus.contains('sugar'),
      saltConcern: _selectedHealthFocus.contains('salt'),
      fatConcern: _selectedHealthFocus.contains('cholesterol'),
    );
    
    final provider = Provider.of<UserPreferencesProvider>(context, listen: false);
    provider.savePreferences(userPrefs);
    provider.completeOnboarding();
    
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const HomeScreen()),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
} 