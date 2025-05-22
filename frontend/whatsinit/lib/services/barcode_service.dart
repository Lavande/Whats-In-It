import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';

class BarcodeService {
  // Start the barcode scanner and return the scanned barcode
  Future<String?> scanBarcode() async {
    try {
      if (kDebugMode) {
        print("Starting barcode scanner...");
      }
      
      final String barcode = await FlutterBarcodeScanner.scanBarcode(
        '#FF6666', // Line color
        'Cancel', // Cancel button text
        true, // Show flash icon
        ScanMode.BARCODE, // Scan mode
      );
      
      if (kDebugMode) {
        print("Scan completed. Result: $barcode");
      }
      
      // If user cancels scan, -1 is returned
      if (barcode == '-1') {
        return null;
      }
      
      return barcode;
    } on PlatformException catch (e) {
      if (kDebugMode) {
        print("Platform exception during scan: ${e.message}, code: ${e.code}, details: ${e.details}");
      }
      throw Exception("Camera permission error: ${e.message}");
    } catch (e) {
      if (kDebugMode) {
        print("Error during scan: $e");
      }
      throw Exception("Barcode scan failed: $e");
    }
  }
} 