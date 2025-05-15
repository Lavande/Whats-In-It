import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../providers/product_provider.dart';
import '../widgets/analysis_result_view.dart';

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
        title: const Text('Product Analysis'),
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
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Brand: ${product.brand}',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          if (product.barcode.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Barcode: ${product.barcode}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 16),
          
          // Ingredients Section (Collapsible)
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
    
    return ExpansionTile(
      title: Text(
        'Ingredients',
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
        ),
      ),
      initiallyExpanded: false,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            ingredientsText,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }

  Widget _buildAnalysisSection(BuildContext context, ProductProvider provider) {
    if (provider.analysisLoadingState == LoadingState.loading) {
      return Container(
        padding: const EdgeInsets.all(32.0),
        alignment: Alignment.center,
        child: Column(
          children: [
            SpinKitFadingCircle(
              color: Theme.of(context).colorScheme.primary,
              size: 50.0,
            ),
            const SizedBox(height: 24),
            Text(
              'Analyzing product...',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'We are examining ingredients, additives, and nutritional information based on your preferences.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
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
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                _formatErrorMessage(provider.errorMessage),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => provider.analyzeProduct(),
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    } else if (provider.analysisResult != null) {
      return AnalysisResultView(result: provider.analysisResult!);
    } else {
      return Container(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          onPressed: () => provider.analyzeProduct(),
          child: const Text('Analyze Product'),
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