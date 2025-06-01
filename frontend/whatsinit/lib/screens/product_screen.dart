import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../providers/product_provider.dart';
import '../widgets/analysis_result_view.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';

class ProductScreen extends StatefulWidget {
  const ProductScreen({Key? key}) : super(key: key);

  @override
  _ProductScreenState createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  @override
  void initState() {
    super.initState();
    // Start analysis automatically when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<ProductProvider>(context, listen: false);
      if (provider.canAnalyze && provider.analysisResult == null) {
        provider.analyzeProduct();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('What\'s In It', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: Consumer<ProductProvider>(
        builder: (context, provider, _) {
          if (provider.product == null) {
            return const Center(
              child: Text('No product information available'),
            );
          }

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Product Information Section
                _buildProductHeader(context, provider),
                
                // Analysis Section
                _buildAnalysisSection(context, provider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProductHeader(BuildContext context, ProductProvider provider) {
    final product = provider.product!;
    
    return Container(
      padding: const EdgeInsets.all(16.0),
      color: Theme.of(context).colorScheme.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            product.name,
            style: GoogleFonts.notoSans(
              fontSize: 22, 
              fontWeight: FontWeight.bold
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Brand: ${product.brand}  |  Barcode: ${product.barcode}',
            style: GoogleFonts.roboto(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          
          // Ingredients Section (Collapsible)
          if (product.ingredientsText.isNotEmpty || product.ingredients.isNotEmpty)
            _buildCollapsibleIngredients(context, product),
        ],
      ),
    );
  }
  
  Widget _buildCollapsibleIngredients(BuildContext context, dynamic product) {
    final ingredientsText = product.ingredientsText.isNotEmpty 
        ? product.ingredientsText 
        : product.ingredients.join(', ');
    
    if (ingredientsText.isEmpty) {
      return Container();
    }
    
    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(vertical: 4.0),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey[200]!, width: 1.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8.0),
        child: ExpansionTile(
          title: Text(
            'Ingredients',
            style: GoogleFonts.roboto(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          leading: const Icon(Icons.receipt_long),
          initiallyExpanded: false,
          childrenPadding: EdgeInsets.zero,
          expandedCrossAxisAlignment: CrossAxisAlignment.start,
          shape: const Border(),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 16.0),
              child: Text(
                ingredientsText,
                style: GoogleFonts.roboto(
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalysisSection(BuildContext context, ProductProvider provider) {
    if (provider.analysisLoadingState == LoadingState.loading) {
      return const LoadingAnalysisView();
    } else if (provider.analysisLoadingState == LoadingState.error) {
      return Container(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Analysis Error',
              style: GoogleFonts.roboto(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                _formatErrorMessage(provider.errorMessage),
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => provider.analyzeProduct(),
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      );
    } else if (provider.analysisResult != null) {
      return AnalysisResultView(result: provider.analysisResult!);
    } else {
      return Container(
        padding: const EdgeInsets.all(24.0),
        child: ElevatedButton.icon(
          onPressed: () => provider.analyzeProduct(),
          icon: const Icon(Icons.search),
          label: const Text('Analyze Product'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            textStyle: GoogleFonts.roboto(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }
  }

  // Helper method to format error messages for better display
  String _formatErrorMessage(String errorMessage) {
    // If it contains detailed backend error, simplify it
    if (errorMessage.contains('Failed to get analysis')) {
      if (errorMessage.contains('422')) {
        return 'The server could not process the request. Please check your product information and try again.';
      } else if (errorMessage.contains('404')) {
        return 'The analysis service could not be found. Please try again later.';
      } else if (errorMessage.contains('500')) {
        return 'The server encountered an error. Please try again later.';
      }
    }
    
    // Return a more generic message
    return 'Unable to analyze this product. Please try again later.';
  }
}

class LoadingAnalysisView extends StatefulWidget {
  const LoadingAnalysisView({Key? key}) : super(key: key);

  @override
  _LoadingAnalysisViewState createState() => _LoadingAnalysisViewState();
}

class _LoadingAnalysisViewState extends State<LoadingAnalysisView> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  int _seconds = 30; // Start from 30 seconds and count down
  late Timer _timer;
  int _messageIndex = 0;
  double _progressValue = 0.0;
  
  // List of encouraging messages to show while loading
  final List<String> _loadingMessages = [
    'Analyzing ingredients and additives...',
    'Checking nutritional information...',
    'Comparing against your preferences...',
    'Identifying potential allergens...',
    'Evaluating nutritional value...',
    'Analyzing for diet compatibility...',
    'Almost there! Finalizing results...',
  ];

  @override
  void initState() {
    super.initState();
    
    // Set up animation controller
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
    
    // Timer to update seconds counter and messages
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _seconds--;
        if (_seconds <= 0) {
          _seconds = 0; // Prevent negative values
        }
        
        // Change message every 4 seconds, cycling through the list
        if (_timer.tick % 4 == 0) {
          _messageIndex = (_messageIndex + 1) % _loadingMessages.length;
        }
        
        // Update progress based on remaining time (30 to 0 seconds)
        _progressValue = 1 - (_seconds / 30.0);
        if (_progressValue > 1.0) _progressValue = 1.0;
        if (_progressValue < 0.0) _progressValue = 0.0;
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32.0),
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Use a more engaging animation from SpinKit
          SpinKitFoldingCube(
            color: Theme.of(context).colorScheme.primary,
            size: 60.0,
            controller: _controller,
          ),
          
          const SizedBox(height: 24),
          
          // Current action message that changes
          Text(
            _loadingMessages[_messageIndex],
            style: GoogleFonts.roboto(
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
          
          const SizedBox(height: 16),
          
          // Add progress indicator
          Container(
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LinearProgressIndicator(
                  value: _progressValue,
                  backgroundColor: Colors.grey[200],
                  color: Theme.of(context).colorScheme.primary,
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 8),
                Text(
                  _seconds > 0 ? 'Estimated time: $_seconds seconds' : 'Analysis in progress...',
                  style: GoogleFonts.roboto(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Reassuring message - simplified
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'AI analysis in progress. This may take up to 30 seconds.',
              textAlign: TextAlign.center,
              style: GoogleFonts.roboto(
                color: Colors.blue[800],
                fontSize: 14,
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Cancel button
          OutlinedButton.icon(
            onPressed: () {
              // Get the provider and cancel the analysis
              final provider = Provider.of<ProductProvider>(context, listen: false);
              provider.cancelAnalysis();
            },
            icon: const Icon(Icons.cancel_outlined),
            label: const Text('Cancel'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.red[700],
              side: BorderSide(color: Colors.red[300]!),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
  
  // Format seconds into mm:ss (not used in simplified version)
  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }
} 