# What's In It - Frontend

Flutter application for the "What's In It" product that helps users analyze food products, their ingredients, additives, and nutritional information based on dietary preferences.

## Features

- Barcode scanning to identify products
- Manual barcode entry
- Product information display
- Comprehensive food analysis based on user preferences
- Analysis of additives, nutrition, diet compatibility, and allergens

## Getting Started

### Prerequisites

- Flutter SDK (2.0.0 or higher)
- Dart (2.12.0 or higher)
- Android Studio / Xcode for mobile development

### Installation

1. Clone the repository
2. Navigate to the frontend/whatsinit directory
3. Install dependencies:

```bash
flutter pub get
```

### Running the App

Ensure the backend server is running first. Then run the app:

```bash
flutter run
```

## API Configuration

The app is currently configured to connect to `http://10.0.2.2:8000` which is the localhost equivalent when running in an Android emulator. You may need to adjust this URL in `lib/services/api_service.dart` depending on your setup:

- For iOS Simulator: Use `http://localhost:8000`
- For real devices: Use the actual IP address of your machine

## App Workflow

1. Home screen offers barcode scanning or manual entry
2. After scanning/entering a barcode, product information is fetched
3. Product screen displays basic information and starts analyzing the product
4. Analysis results are displayed in expandable sections

## Development Notes

- Only iOS and Web versinos have been tested