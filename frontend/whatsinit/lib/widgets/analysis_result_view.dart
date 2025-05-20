import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/analysis_result.dart';

class AnalysisResultView extends StatelessWidget {
  final AnalysisResult result;
  // Key for source section to allow scrolling to it
  final GlobalKey _sourcesKey = GlobalKey();

  AnalysisResultView({Key? key, required this.result}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Overall Rating Card (Primary Visual Focus)
          _buildOverallRatingCard(context),
          
          const SizedBox(height: 24),
          
          // Nutrition Section with Expandable Cards
          _buildNutritionSection(context),
          
          const SizedBox(height: 24),
          
          // Key Ingredients Section with Chips
          _buildKeyIngredientsSection(context),
          
          const SizedBox(height: 24),
          
          // Additives Section with Safety Indicators
          _buildAdditivesSection(context),
          
          const SizedBox(height: 24),
          
          // Sources Section with Link Icons
          _buildSourcesSection(context),
        ],
      ),
    );
  }

  // Helper method to find and make citations clickable in text
  RichText _buildClickableReferences(BuildContext context, String text, TextStyle baseStyle, {TextAlign textAlign = TextAlign.start}) {
    // Regular expression to match citation patterns like [1], [2][3], etc.
    final RegExp citationRegex = RegExp(r'\[\d+\]');
    
    // Find all matches in the text
    final matches = citationRegex.allMatches(text);
    
    // Handle empty or blank text
    if (text.trim().isEmpty) {
      return RichText(textAlign: textAlign, text: TextSpan(text: '', style: baseStyle));
    }
    
    // If no citations, return simple text with baseStyle and specified alignment
    if (matches.isEmpty) {
      return RichText(
        textAlign: textAlign, // Use specified textAlign
        text: TextSpan(text: text, style: baseStyle)
      );
    }
    
    // Build spans with clickable citations
    List<TextSpan> spans = [];
    int lastEnd = 0;
    
    for (final match in matches) {
      // Add text before citation
      if (match.start > lastEnd) {
        spans.add(TextSpan(
          text: text.substring(lastEnd, match.start),
          style: baseStyle, // Apply baseStyle
        ));
      }
      
      // Add clickable citation (keeps its own style for emphasis)
      final citation = text.substring(match.start, match.end);
      spans.add(TextSpan(
        text: citation,
        style: TextStyle(
          color: Colors.blue, // Link color
          fontWeight: FontWeight.bold,
          decoration: TextDecoration.underline, // Optional: add underline to links
        ).merge(baseStyle.copyWith(decoration: TextDecoration.underline, color: Colors.blue, fontWeight: FontWeight.bold )), // Merge to inherit size etc. but override color/weight
        recognizer: TapGestureRecognizer()
          ..onTap = () {
            final citationNumber = int.tryParse(citation.replaceAll(RegExp(r'[\[\]]'), ''));
            if (citationNumber != null) {
              Scrollable.ensureVisible(
                _sourcesKey.currentContext!,
                duration: const Duration(milliseconds: 300),
                alignment: 0.5,
              );
            }
          },
      ));
      
      lastEnd = match.end;
    }
    
    // Add any remaining text after the last citation
    if (lastEnd < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastEnd),
        style: baseStyle, // Apply baseStyle
      ));
    }
    
    return RichText(
      textAlign: textAlign, // Use specified textAlign
      text: TextSpan(children: spans, style: baseStyle), // Apply baseStyle as default for the TextSpan
    );
  }

  Widget _buildOverallRatingCard(BuildContext context) {
    final recommendation = result.getRecommendation();
    final recommendationReason = result.getRecommendationReason();
    final overallScore = result.getOverallRating();
    
    List<Color> gradientColors;
    Color circleBgColor;
    Color labelColor;
    String emoji;
    String statusText;

    // Determine colors, emoji, and status text based on score
    if (overallScore >= 71) { // High Score (71-100)
      gradientColors = [const Color(0xFFE8F5E9), const Color(0xFFF1F8E9)];
      circleBgColor = const Color(0xFF81C784); // Material Colors.green[300]
      labelColor = const Color(0xFF388E3C);   // Material Colors.green[700]
      statusText = 'Recommended';
      emoji = '😄';
    } else if (overallScore >= 41) { // Medium Score (41-70)
      gradientColors = [const Color(0xFFFFF4E5), const Color(0xFFFFF8E1)];
      circleBgColor = const Color(0xFFFFB74D); // Material Colors.orange[300]
      labelColor = const Color(0xFFFB8C00);   // Material Colors.orange[700]
      statusText = 'Consume in Moderation';
      emoji = '🙂';
    } else { // Low Score (0-40)
      gradientColors = [const Color(0xFFFCEAEA), const Color(0xFFFFF5F5)];
      circleBgColor = const Color(0xFFE57373); // Material Colors.red[300]
      labelColor = const Color(0xFFD32F2F);   // Material Colors.red[700]
      statusText = 'Not Recommended';
      emoji = '😕';
    }
    
    return Container(
      margin: const EdgeInsets.only(bottom: 24.0), // Consistent with other section gaps
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2), // Softer shadow as per typical modern UI
            spreadRadius: 1,
            blurRadius: 4, // Elevation 2-4 range
            offset: const Offset(0, 2), // Shadow position
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center, // Center children horizontally
        children: [
          // Score Circle
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: circleBgColor,
            ),
            child: Center(
              child: Text(
                '$overallScore',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Status Label with Emoji
          Text(
            '$emoji $statusText',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600, // semi-bold
              color: labelColor,
            ),
          ),
          const SizedBox(height: 12), // Spacing before recommendation reason

          // Recommendation Reason
          if (recommendationReason.isNotEmpty)
            _buildClickableReferences(
              context,
              recommendationReason,
              // Base style for the recommendation reason text
              TextStyle(fontSize: 14, color: Colors.grey[800], height: 1.5),
              textAlign: TextAlign.start, // Changed to left alignment (start)
          ),
        ],
      ),
    );
  }

  Widget _buildNutritionSection(BuildContext context) {
    final nutrition = result.nutritionAnalysis;
    final nutritionItems = nutrition.entries.toList();
    final hasNutrition = nutritionItems.isNotEmpty;
    
    // Primary nutrients to show by default (carbohydrates, fat, protein)
    final List<String> primaryNutrientKeywords = ['Carbohydrate', 'Carbs', 'Fat', 'Protein', 'Proteins'];
    
    // Split nutrition items into primary and secondary entries
    final List<MapEntry<String, dynamic>> primaryEntries = [];
    final List<MapEntry<String, dynamic>> secondaryEntries = [];
    
    for (var entry in nutritionItems) {
      if (primaryNutrientKeywords.any((keyword) => 
          entry.key.toLowerCase().contains(keyword.toLowerCase()))) {
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
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        if (hasNutrition) ...[
          ...primaryEntries.map((entry) => _buildNutritionExpansionTile(context, entry.key, entry.value)),
          
          if (secondaryEntries.isNotEmpty) ...[
            const SizedBox(height: 16),
            Card(
              elevation: 0,
              margin: const EdgeInsets.symmetric(vertical: 4.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
                side: BorderSide(color: Colors.grey[200]!, width: 1.0),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8.0),
                child: ExpansionTile(
                  title: const Text('More Nutrition Information'),
                  childrenPadding: EdgeInsets.zero,
                  expandedCrossAxisAlignment: CrossAxisAlignment.start,
                  shape: const Border(),
                  children: secondaryEntries.map(
                    (entry) => _buildNutritionExpansionTile(context, entry.key, entry.value)
                  ).toList(),
                ),
              ),
            ),
          ],
        ] else ...[
          const Text('No nutrition information available'),
        ],
      ],
    );
  }
  
  Widget _buildNutritionExpansionTile(BuildContext context, String name, dynamic data) {
    if (data is Map) {
      final value = data['value'] ?? 'Not specified';
      final healthRating = data['health_rating'] ?? 'unknown';
      final reason = data['reason'] ?? '';
      
      // Determine icon and color based on nutrient type
      IconData icon;
      if (name.toLowerCase().contains('carb')) {
        icon = Icons.bakery_dining;
      } else if (name.toLowerCase().contains('fat')) {
        icon = Icons.opacity;
      } else if (name.toLowerCase().contains('protein')) {
        icon = Icons.fitness_center;
      } else if (name.toLowerCase().contains('sugar')) {
        icon = Icons.cookie;
      } else if (name.toLowerCase().contains('salt') || name.toLowerCase().contains('sodium')) {
        icon = Icons.grain;
      } else {
        icon = Icons.science;
      }
      
      // Determine health rating color
      Color ratingColor;
      String emojiIndicator;
      if (healthRating == 'healthy') {
        ratingColor = Colors.green;
        emojiIndicator = '🟢';
      } else if (healthRating == 'moderate') {
        ratingColor = Colors.amber;
        emojiIndicator = '🟡';
      } else {
        ratingColor = Colors.red;
        emojiIndicator = '🔴';
      }
      
      return Card(
        elevation: 0,
        margin: const EdgeInsets.symmetric(vertical: 4.0),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
          side: BorderSide(color: Colors.grey[200]!, width: 1.0),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(8.0),
          child: ExpansionTile(
            leading: Icon(icon, color: ratingColor),
            title: Text('$name $value', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('$emojiIndicator $healthRating'.toUpperCase(), 
              style: TextStyle(color: ratingColor, fontSize: 12, fontWeight: FontWeight.bold)),
            childrenPadding: EdgeInsets.zero,
            expandedCrossAxisAlignment: CrossAxisAlignment.start,
            shape: const Border(),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: _buildClickableReferences(context, reason, Theme.of(context).textTheme.bodyLarge!),
              ),
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
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        if (hasIngredients) ...[
          ...ingredients.entries.map((entry) {
            final name = entry.key;
            final data = entry.value;
            
            if (data is Map) {
              final description = data['description'] ?? '';
              final healthImpact = data['health_impact'] ?? '';
              
              // Determine color and icon based on health impact
              IconData icon;
              Color iconColor;
              
              if (healthImpact.toLowerCase().contains('incompatible') || 
                  healthImpact.toLowerCase().contains('risk') ||
                  healthImpact.toLowerCase().contains('unsuitable') ||
                  healthImpact.toLowerCase().contains('disrupt')) {
                iconColor = Colors.red;
                icon = Icons.warning;
              } else if (healthImpact.toLowerCase().contains('beneficial') || 
                         healthImpact.toLowerCase().contains('positive') ||
                         healthImpact.toLowerCase().contains('good')) {
                iconColor = Colors.green;
                icon = Icons.check_circle;
              } else {
                iconColor = Colors.orange;
                icon = Icons.info;
              }
              
              return Card(
                elevation: 0,
                margin: const EdgeInsets.symmetric(vertical: 4.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  side: BorderSide(color: Colors.grey[200]!, width: 1.0),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8.0),
                  child: ExpansionTile(
                    leading: Icon(icon, color: iconColor),
                    title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    childrenPadding: EdgeInsets.zero,
                    expandedCrossAxisAlignment: CrossAxisAlignment.start,
                    shape: const Border(),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (description.isNotEmpty) ...[
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('📄 ', style: TextStyle(fontSize: 16)),
                                  Expanded(
                                    child: Text(
                                      description,
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                            ],
                            if (healthImpact.isNotEmpty) ...[
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('📊 ', style: TextStyle(fontSize: 16)),
                                  Expanded(
                                    child: _buildClickableReferences(
                                      context,
                                      healthImpact,
                                      Theme.of(context).textTheme.bodyLarge!
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            } else {
              return ListTile(
                leading: Icon(Icons.circle, color: Colors.grey),
                title: Text(name)
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
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        if (hasAdditives) ...[
          ...additives.entries.map((entry) {
            final name = entry.key;
            final data = entry.value;
            
            if (data is Map) {
              // final code = data['code'] ?? ''; // Code not shown in collapsed view
              final safetyLevel = data['safety_level'] ?? 'Unknown';
              final description = data['description'] ?? '';
              final potentialEffects = data['potential_effects'] ?? '';
              
              // Determine icon and color based on safety level for the leading part of ExpansionTile
              IconData safetyIcon;
              Color safetyIconColor;
              
              switch (safetyLevel.toLowerCase()) {
                case 'safe':
                  safetyIcon = Icons.check_circle;
                  safetyIconColor = Colors.green;
                  break;
                case 'caution':
                  safetyIcon = Icons.info_outline;
                  safetyIconColor = Colors.amber; // Or Colors.orange
                  break;
                case 'avoid':
                  safetyIcon = Icons.warning_amber_outlined; // Using a more specific warning icon
                  safetyIconColor = Colors.red;
                  break;
                default: // Unknown or other cases
                  safetyIcon = Icons.help_outline;
                  safetyIconColor = Colors.grey;
              }
              
              return Card(
                elevation: 0,
                margin: const EdgeInsets.symmetric(vertical: 4.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  side: BorderSide(color: Colors.grey[200]!, width: 1.0),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8.0),
                  child: ExpansionTile(
                    leading: Icon(safetyIcon, color: safetyIconColor),
                    title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    childrenPadding: EdgeInsets.zero,
                    expandedCrossAxisAlignment: CrossAxisAlignment.start,
                    shape: const Border(), // Removes default ExpansionTile borders
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (description.isNotEmpty) ...[
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(Icons.science, color: Colors.green, size: 20), // Green flask icon
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      description,
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                            ],
                            if (potentialEffects.isNotEmpty) ...[
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('📖 ', style: TextStyle(fontSize: 16)), // Document research emoji
                                  Expanded(
                                    child: _buildClickableReferences(
                                      context,
                                      potentialEffects,
                                      Theme.of(context).textTheme.bodyLarge!
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            } else {
              // Fallback for unexpected data format
              return ListTile(
                leading: Icon(Icons.circle, color: Colors.grey),
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
      key: _sourcesKey, // Add key for scrolling to this section
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Information Sources',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        if (sources.isNotEmpty) ...[
          ...sources.asMap().entries.map((entry) {
            final index = entry.key + 1; // 1-based index for display
            final source = entry.value;
            final title = source['title'] ?? 'Unknown source';
            final url = source['url'] ?? '';
            
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4.0), // Add some vertical spacing
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '[$index]',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: Theme.of(context).textTheme.bodyLarge?.fontSize, // Match title font size
                      color: Theme.of(context).colorScheme.primary, // Make it slightly prominent
                    ),
                  ),
                  const SizedBox(width: 8), // Space between index and title
                  Expanded(
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(text: title),
                          if (url.isNotEmpty)
                            WidgetSpan(
                              alignment: PlaceholderAlignment.middle, // Align icon nicely with text
                              child: Padding(
                                padding: const EdgeInsets.only(left: 4.0), // Small space before icon
                                child: InkWell(
                                  onTap: () => _launchUrl(url),
                                  child: Icon(
                                    Icons.open_in_new,
                                    size: 16, // Smaller icon
                                    color: Colors.blue,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
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