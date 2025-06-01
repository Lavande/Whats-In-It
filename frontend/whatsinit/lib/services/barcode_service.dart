import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class BarcodeService {
  // Show a fullscreen scanner in a new route
  Future<String?> scanBarcode(BuildContext context) async {
    try {
      if (kDebugMode) {
        print("Starting barcode scanner...");
      }

      final result = await Navigator.of(context).push<String>(
        MaterialPageRoute(
          builder: (context) => _BarcodeScannerScreen(),
        ),
      );

      if (kDebugMode) {
        print("Scan completed. Result: $result");
      }

      return result;
    } catch (e) {
      if (kDebugMode) {
        print("Error during scan: $e");
      }
      throw Exception("Barcode scan failed: $e");
    }
  }
}

class _BarcodeScannerScreen extends StatefulWidget {
  @override
  State<_BarcodeScannerScreen> createState() => __BarcodeScannerScreenState();
}

class __BarcodeScannerScreenState extends State<_BarcodeScannerScreen> {
  bool isDetected = false;

  void _onBarcodeDetected(String barcode) {
    if (!isDetected) {
      isDetected = true;
      Navigator.of(context).pop(barcode);
    }
  }

  void _onError() {
    if (!isDetected) {
      isDetected = true;
      Navigator.of(context).pop(null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Scan Barcode'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: MobileScanner(
        onDetect: (BarcodeCapture capture) {
          final barcode = capture.barcodes.first;
          if (barcode.rawValue != null && !isDetected) {
            _onBarcodeDetected(barcode.rawValue!);
          }
        },
      ),
    );
  }
} 