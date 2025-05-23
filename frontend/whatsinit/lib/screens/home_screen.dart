import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/product_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../screens/product_screen.dart';
import '../screens/onboarding_screen.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _barcodeController = TextEditingController();
  final TextEditingController _ipController = TextEditingController();
  bool _isTestingConnection = false;
  String _connectionStatus = "";
  bool _showNetworkSettings = false;

  @override
  void initState() {
    super.initState();
    // Default to the current configured baseUrl
    final apiService = ApiService();
    _ipController.text = apiService.baseUrl.contains("render.com") 
        ? apiService.baseUrl
        : apiService.baseUrl.replaceAll(RegExp('https?://'), '').replaceAll(':8000', '');
  }

  @override
  void dispose() {
    _barcodeController.dispose();
    _ipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("What's In It"),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        actions: [
          IconButton(
            icon: const Icon(Icons.network_wifi),
            onPressed: () {
              setState(() {
                _showNetworkSettings = !_showNetworkSettings;
              });
            },
          ),
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
            // Network settings section
            if (_showNetworkSettings) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Network Settings',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _ipController,
                            decoration: const InputDecoration(
                              labelText: 'Server Address',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton(
                          onPressed: _setCustomIp,
                          child: const Text('Use'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).colorScheme.secondary,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _useOnlineBackend,
                            icon: const Icon(Icons.cloud),
                            label: const Text('Use Online Backend'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _useLocalBackend,
                            icon: const Icon(Icons.computer),
                            label: const Text('Use Local Backend'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton.icon(
                      onPressed: _testConnection,
                      icon: const Icon(Icons.network_check),
                      label: const Text('Test Connection'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    if (_isTestingConnection)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 10),
                        child: LinearProgressIndicator(),
                      ),
                    if (_connectionStatus.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 10),
                        child: Text(
                          'Connection Status: $_connectionStatus',
                          style: TextStyle(
                            color: _connectionStatus.contains("SUCCESS") || _connectionStatus.contains("http")
                                ? Colors.green
                                : Colors.red,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
            const Spacer(),
            Icon(
              Icons.local_offer_outlined,
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
            const Spacer(),
          ],
        ),
      ),
    );
  }

  void _setCustomIp() {
    if (_ipController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a server address')),
      );
      return;
    }

    try {
      // 获取provider中现有的ApiService实例
      final provider = Provider.of<ProductProvider>(context, listen: false);
      final apiService = provider.apiService;
      
      // 设置自定义IP地址
      apiService.setCustomBaseUrl(_ipController.text);
      
      // 不需要更新provider，因为我们使用的是它的实例
      
      // 不要自动测试连接了
      // _testConnection();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Server address set to: ${apiService.baseUrl}')),
      );
      
      setState(() {
        _connectionStatus = "Set to: ${apiService.baseUrl}";
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error setting IP: ${e.toString()}')),
      );
    }
  }

  Future<void> _testConnection() async {
    setState(() {
      _isTestingConnection = true;
      _connectionStatus = "Testing connection...";
    });

    try {
      // 使用当前apiService进行测试，而不是创建新的
      final provider = Provider.of<ProductProvider>(context, listen: false);
      final apiService = provider.apiService; // Get the current apiService from provider
      final result = await apiService.findWorkingServerUrl();
      
      setState(() {
        if (result == apiService.baseUrl) {
          _connectionStatus = "Current connection is working: $result";
        } else if (result.contains("http")) {
          _connectionStatus = "Found working alternative: $result";
        } else {
          _connectionStatus = result; // No working connection found
        }
        _isTestingConnection = false;
        // 不要修改输入框的内容
      });
      
      // Only show snackbar, but don't change the URL
      if (result.contains("http")) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection test successful: $result')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not connect to any server')),
        );
      }
    } catch (e) {
      setState(() {
        _connectionStatus = "Error: ${e.toString()}";
        _isTestingConnection = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Connection test error: ${e.toString()}')),
      );
    }
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

  void _useOnlineBackend() {
    try {
      // Get provider's existing ApiService
      final provider = Provider.of<ProductProvider>(context, listen: false);
      final apiService = provider.apiService;
      
      apiService.useOnlineBackend();
      
      // No need to update provider as we're using its instance
      
      setState(() {
        _ipController.text = apiService.baseUrl;
        _connectionStatus = "Using online backend: ${apiService.baseUrl}";
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Switched to online backend: ${apiService.baseUrl}')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error switching to online backend: ${e.toString()}')),
      );
    }
  }

  void _useLocalBackend() {
    try {
      // Get provider's existing ApiService
      final provider = Provider.of<ProductProvider>(context, listen: false);
      final apiService = provider.apiService;
      
      apiService.useLocalBackend();
      
      // No need to update provider as we're using its instance
      
      setState(() {
        _ipController.text = apiService.baseUrl;
        _connectionStatus = "Using local backend: ${apiService.baseUrl}";
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Switched to local backend: ${apiService.baseUrl}')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error switching to local backend: ${e.toString()}')),
      );
    }
  }
} 