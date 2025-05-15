import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/analysis_result.dart';

class AnalysisResultView extends StatelessWidget {
  final AnalysisResult result;

  const AnalysisResultView({Key? key, required this.result}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Section
          _buildSummarySection(context),
          
          const SizedBox(height: 24),
          const Divider(),
          
          // Nutrition Section
          _buildNutritionSection(context),
          
          const SizedBox(height: 24),
          const Divider(),
          
          // Key Ingredients Section
          _buildKeyIngredientsSection(context),
          
          const SizedBox(height: 24),
          const Divider(),
          
          // Additives Section
          _buildAdditivesSection(context),
          
          const SizedBox(height: 24),
          const Divider(),
          
          // Sources Section
          _buildSourcesSection(context),
        ],
      ),
    );
  }

  Widget _buildSummarySection(BuildContext context) {
    final summary = result.summary;
    final recommendation = result.getRecommendation();
    final recommendationReason = result.getRecommendationReason();
    final overallScore = result.getOverallRating();
    
    Color scoreColor;
    if (overallScore >= 80) {
      scoreColor = Colors.green;
    } else if (overallScore >= 50) {
      scoreColor = Colors.amber;
    } else {
      scoreColor = Colors.red;
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Summary',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: scoreColor,
              ),
              alignment: Alignment.center,
              child: Text(
                '$overallScore',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 24,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                recommendation,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: recommendation.toLowerCase().contains('not') ? Colors.red : Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (recommendationReason.isNotEmpty) ...[
          Text(
            'Reason:',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(recommendationReason),
        ],
      ],
    );
  }

  Widget _buildNutritionSection(BuildContext context) {
    final nutrition = result.nutritionAnalysis;
    final nutritionItems = nutrition.entries.toList();
    final hasNutrition = nutritionItems.isNotEmpty;
    
    // Primary nutrients to show by default (sugar, fat, protein)
    final List<String> primaryNutrients = ['Sugar', 'Fat', 'Protein', 'Proteins'];
    
    // Secondary nutrients to show in the "More" section
    final List<MapEntry<String, dynamic>> primaryEntries = [];
    final List<MapEntry<String, dynamic>> secondaryEntries = [];
    
    // Split nutrition items into primary and secondary entries
    for (var entry in nutritionItems) {
      if (primaryNutrients.contains(entry.key)) {
        primaryEntries.add(entry);
      } else {
        secondaryEntries.add(entry);
      }
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Nutrition Analysis',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        if (hasNutrition) ...[
          // Always show primary nutrients
          ...primaryEntries.map((entry) => _buildNutritionItem(context, entry.key, entry.value)),
          
          // Show additional nutrients in an expansion panel if there are any
          if (secondaryEntries.isNotEmpty) ...[
            const SizedBox(height: 16),
            ExpansionTile(
              title: Text(
                'More Nutrition Info',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              initiallyExpanded: false,
              children: [
                ...secondaryEntries.map((entry) => _buildNutritionItem(context, entry.key, entry.value)),
              ],
            ),
          ],
        ] else ...[
          const Text('No nutrition information available'),
        ],
      ],
    );
  }
  
  Widget _buildNutritionItem(BuildContext context, String name, dynamic data) {
    if (data is Map) {
      final value = data['value'] ?? 'Not specified';
      final healthRating = data['health_rating'] ?? 'unknown';
      final reason = data['reason'] ?? '';
      
      Color ratingColor;
      if (healthRating == 'healthy') {
        ratingColor = Colors.green;
      } else if (healthRating == 'moderate') {
        ratingColor = Colors.amber;
      } else {
        ratingColor = Colors.red;
      }
      
      return Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '$name: $value',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: ratingColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      healthRating.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              if (reason.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  reason,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ],
          ),
        ),
      );
    } else {
      return ListTile(
        title: Text(name),
        subtitle: Text(data.toString()),
      );
    }
  }

  Widget _buildKeyIngredientsSection(BuildContext context) {
    final ingredients = result.keyIngredientsAnalysis;
    final hasIngredients = ingredients.isNotEmpty;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Key Ingredients',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        if (hasIngredients) ...[
          ...ingredients.entries.map((entry) {
            final name = entry.key;
            final data = entry.value;
            
            if (data is Map) {
              final description = data['description'] ?? '';
              final healthImpact = data['health_impact'] ?? '';
              
              // Determine color based on health impact text
              Color impactColor = Colors.grey;
              if (healthImpact.toLowerCase().contains('incompatible') || 
                  healthImpact.toLowerCase().contains('risk') ||
                  healthImpact.toLowerCase().contains('unsuitable') ||
                  healthImpact.toLowerCase().contains('disrupt')) {
                impactColor = Colors.red;
              } else if (healthImpact.toLowerCase().contains('beneficial') || 
                         healthImpact.toLowerCase().contains('positive') ||
                         healthImpact.toLowerCase().contains('good')) {
                impactColor = Colors.green;
              } else if (healthImpact.toLowerCase().contains('moderate') || 
                         healthImpact.toLowerCase().contains('neutral')) {
                impactColor = Colors.amber;
              }
              
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (description.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          description,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                      if (healthImpact.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Health Impact:',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          healthImpact,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: impactColor,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            } else {
              return ListTile(
                title: Text(name),
                subtitle: Text(data.toString()),
              );
            }
          }),
        ] else ...[
          const Text('No key ingredients information available'),
        ],
      ],
    );
  }

  Widget _buildAdditivesSection(BuildContext context) {
    final additives = result.additiveAnalysis;
    final hasAdditives = additives.isNotEmpty;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Additives',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        if (hasAdditives) ...[
          ...additives.entries.map((entry) {
            final name = entry.key;
            final data = entry.value;
            
            if (data is Map) {
              final code = data['code'] ?? '';
              final safetyLevel = data['safety_level'] ?? 'Unknown';
              final description = data['description'] ?? '';
              final potentialEffects = data['potential_effects'] ?? '';
              
              // Determine color based on safety level
              Color safetyColor;
              if (safetyLevel.toLowerCase() == 'safe') {
                safetyColor = Colors.green;
              } else if (safetyLevel.toLowerCase() == 'caution') {
                safetyColor = Colors.amber;
              } else if (safetyLevel.toLowerCase() == 'avoid') {
                safetyColor = Colors.red;
              } else {
                safetyColor = Colors.grey;
              }
              
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '$name ${code.isNotEmpty ? '($code)' : ''}',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: safetyColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              safetyLevel.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (description.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          description,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                      if (potentialEffects.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Potential Effects:',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          potentialEffects,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
              );
            } else {
              return ListTile(
                title: Text(name),
                subtitle: Text(data.toString()),
              );
            }
          }),
        ] else ...[
          const Text('No additives information available'),
        ],
      ],
    );
      }
  
    Widget _buildSourcesSection(BuildContext context) {
    final sources = result.sources;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sources',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        if (sources.isNotEmpty) ...[
          ...sources.asMap().entries.map((entry) {
            final index = entry.key + 1;
            final source = entry.value;
            final title = source['title'] ?? 'Unknown source';
            final url = source['url'] ?? '';
            
            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: InkWell(
                onTap: url.isNotEmpty ? () => _launchUrl(url) : null,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '[$index] ',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        title,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: url.isNotEmpty ? Colors.blue : null,
                          decoration: url.isNotEmpty ? TextDecoration.underline : null,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ] else ...[
          const Text('No sources available'),
        ],
      ],
    );
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    try {
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw Exception('Could not launch $url');
      }
    } catch (e) {
      print('Error launching URL: $e');
    }
  }
} 