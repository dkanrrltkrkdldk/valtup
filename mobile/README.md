# Point Roulette Mobile App

Flutter WebView wrapper for the Point Roulette web service.

## Features

- WebView wrapper for the user web app
- Back button handling (WebView history navigation)
- Session/cookie persistence (login state maintained)
- Network error handling with retry functionality
- Loading indicator
- Offline detection with auto-retry on reconnection
- Custom app icon and splash screen support

## Prerequisites

- Flutter SDK 3.x+
- Android Studio / Xcode
- For Android: Android SDK 21+
- For iOS: iOS 12.0+

## Setup

```bash
# Install dependencies
flutter pub get

# Generate app icons (after adding PNG images)
flutter pub run flutter_launcher_icons

# Generate splash screen
flutter pub run flutter_native_splash:create
```

## App Icon Setup

1. Create a 1024x1024 PNG image for the app icon
2. Save as `assets/images/app_icon.png`
3. Create a foreground-only version for Android adaptive icons
4. Save as `assets/images/app_icon_foreground.png`
5. Run: `flutter pub run flutter_launcher_icons`

## Splash Screen Setup

1. Create a logo image (recommended: 300x300 PNG with transparency)
2. Save as `assets/images/splash_logo.png`
3. Run: `flutter pub run flutter_native_splash:create`

## Running

```bash
# Run on connected device/emulator
flutter run

# Run on specific device
flutter run -d <device_id>
```

## Building

### Android APK

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### iOS

```bash
# Build for iOS simulator
flutter build ios --simulator

# Build for release (requires Apple Developer account)
flutter build ios --release
```

## Configuration

The web app URL is configured in `lib/main.dart`:

```dart
const String kWebAppUrl = 'https://point-roulette.vercel.app';
```

Update this URL to match your deployed web app.

## Project Structure

```
lib/
  main.dart          # Main app with WebView and error handling
assets/
  images/
    app_icon.svg     # App icon source (convert to PNG)
    splash_logo.svg  # Splash logo source (convert to PNG)
```

## Troubleshooting

### WebView not loading on Android

Add internet permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

### iOS App Transport Security

If loading HTTP URLs, add to `ios/Runner/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### Cookies not persisting

The WebView uses system cookies by default. Session persistence should work automatically for most cases.
