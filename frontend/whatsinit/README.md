# What's In It - Flutter App

A Flutter application for product analysis with barcode scanning capabilities.

## Features

- **Cross-platform barcode scanning** - Works on iOS, Android, and Web
- Product information lookup
- Ingredient analysis
- User preferences management
- Comprehensive product analysis

## Barcode Scanner Migration

This app has been migrated from `flutter_barcode_scanner` to `mobile_scanner` to support Web platform:

### Key Changes

1. **Package Migration**: Replaced `flutter_barcode_scanner: ^2.0.0` with `mobile_scanner: ^3.5.7`
2. **API Changes**: Updated from function-based to widget-based scanner implementation
3. **Web Support**: Added camera permissions for Web platform
4. **Cross-platform Compatibility**: Unified implementation across iOS, Android, and Web

### Platform Support

- ✅ **iOS**: Full camera access with permission handling
- ✅ **Android**: Full camera access with permission handling  
- ✅ **Web**: Camera access through browser APIs (requires HTTPS in production)

### Scanner Features

- Fullscreen scanning interface
- Torch/flashlight toggle
- Camera switching (front/back)
- Custom scanning overlay with visual guides
- Error handling and permission management

## Getting Started

### Prerequisites

- Flutter SDK (>=3.0.0)
- For iOS: Xcode and iOS development setup
- For Android: Android Studio and Android SDK
- For Web: Modern browser with camera support

### Installation

1. Clone the repository
2. Navigate to the frontend/whatsinit directory
3. Install dependencies:
   ```bash
   flutter pub get
   ```

### Running the App

#### Web
```bash
flutter run -d chrome
```

#### iOS
```bash
flutter run -d ios
```

#### Android
```bash
flutter run -d android
```

### Building for Production

#### Web
```bash
flutter build web --no-tree-shake-icons
```

#### iOS
```bash
flutter build ios --release
```

#### Android
```bash
flutter build apk --release
```

## Permissions

### iOS
Camera permission is configured in `ios/Runner/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan barcodes</string>
```

### Android
Camera permission is configured in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

### Web
Camera permissions are handled through browser APIs. The app includes meta tags for better PWA support:
```html
<meta name="permissions" content="camera">
<meta name="permission-delegations" content="camera">
```

## Architecture

The barcode scanning functionality is implemented in:
- `lib/services/barcode_service.dart` - Core scanning service
- `lib/providers/product_provider.dart` - State management
- `lib/screens/home_screen.dart` - UI integration

## Notes

- Web version requires HTTPS for camera access in production
- First-time camera access will prompt for user permission
- Scanner automatically detects and processes barcodes
- Supports various barcode formats (EAN, UPC, Code128, etc.)
