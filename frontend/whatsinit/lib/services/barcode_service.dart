import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';

class BarcodeService {
  // Start the barcode scanner and return the scanned barcode
  Future<String?> scanBarcode() async {
    try {
      final String barcode = await FlutterBarcodeScanner.scanBarcode(
        '#FF6666', // Line color
        'Cancel', // Cancel button text
        true, // Show flash icon
        ScanMode.BARCODE, // Scan mode
      );
      
      // If user cancels scan, -1 is returned
      if (barcode == '-1') {
        return null;
      }
      
      return barcode;
    } on PlatformException {
      return null;
    } catch (e) {
      return null;
    }
  }
} 