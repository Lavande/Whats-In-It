import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/product_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../screens/product_screen.dart';
import '../screens/onboarding_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _barcodeController = TextEditingController();

  @override
  void dispose() {
    _barcodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("What's In It"),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'reset_onboarding') {
                _resetOnboarding();
              }
            },
            itemBuilder: (BuildContext context) => [
              const PopupMenuItem<String>(
                value: 'reset_onboarding',
                child: Text('Reset Onboarding'),
              ),
            ],
          ),
        ],
      ),
      body: Container(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(
              Icons.food_bank_outlined,
              size: 100,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 30),
            Text(
              'Scan a product to analyze its ingredients',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 50),
            ElevatedButton.icon(
              onPressed: () => _scanBarcode(context),
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Scan Barcode'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            const Text('OR', textAlign: TextAlign.center),
            const SizedBox(height: 20),
            TextField(
              controller: _barcodeController,
              decoration: const InputDecoration(
                labelText: 'Enter barcode manually',
                border: OutlineInputBorder(),
                suffixIcon: Icon(Icons.numbers),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () => _submitBarcode(context),
              child: const Text('Submit Barcode'),
            ),
          ],
        ),
      ),
    );
  }

  void _scanBarcode(BuildContext context) async {
    final provider = Provider.of<ProductProvider>(context, listen: false);
    
    try {
      await provider.scanAndLoadProduct();
      
      if (provider.productLoadingState == LoadingState.success) {
        // Navigate to product screen if scan was successful
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ProductScreen()),
        );
      } else if (provider.productLoadingState == LoadingState.error) {
        // Show error message if scan failed
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.errorMessage),
            duration: const Duration(seconds: 3),
            action: provider.errorMessage.contains("permission") 
              ? SnackBarAction(
                  label: 'Settings',
                  onPressed: () {
                    // This would open app settings on a real implementation
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please open Settings and enable camera access')),
                    );
                  },
                ) 
              : null,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  void _submitBarcode(BuildContext context) async {
    if (_barcodeController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a barcode')),
      );
      return;
    }

    final provider = Provider.of<ProductProvider>(context, listen: false);
    await provider.loadProductByBarcode(_barcodeController.text);
    
    if (provider.productLoadingState == LoadingState.success) {
      // Navigate to product screen if load was successful
      _barcodeController.clear();
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const ProductScreen()),
      );
    } else if (provider.productLoadingState == LoadingState.error) {
      // Show error message if load failed
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.errorMessage)),
      );
    }
  }

  void _resetOnboarding() {
    final provider = Provider.of<UserPreferencesProvider>(context, listen: false);
    provider.resetOnboarding();
    
    // Navigate back to onboarding screen
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const OnboardingScreen()),
    );
  }
} 