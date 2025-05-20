import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../providers/product_provider.dart';
import '../widgets/analysis_result_view.dart';
import 'package:google_fonts/google_fonts.dart';

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
              style: GoogleFonts.roboto(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'We are examining ingredients, additives, and nutritional information based on your preferences.',
              textAlign: TextAlign.center,
              style: GoogleFonts.roboto(
                color: Colors.grey[700],
              ),
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