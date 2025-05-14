import 'dart:io' show Platform;

class AppConstants {
  static final String _devBaseUrl = _getBaseUrl();

  static String get baseUrl => _devBaseUrl;

  static String _getBaseUrl() {
    if (Platform.isAndroid) {
      // Use 10.0.2.2 for Android Emulator to connect to host localhost
      return 'https://bounswe2025group4-327739565032.europe-west1.run.app/api';
    } else if (Platform.isIOS) {
      // iOS Simulator usually works with localhost
      return 'https://bounswe2025group4-327739565032.europe-west1.run.app/api';
    } else {
      // Default for other platforms (web, desktop - might need adjustment)
      return 'https://bounswe2025group4-327739565032.europe-west1.run.app/api';
    }
  }
}
