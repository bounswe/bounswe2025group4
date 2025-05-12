import 'dart:io' show Platform;

class AppConstants {
  static final String _devBaseUrl = _getBaseUrl();

  static String get baseUrl => _devBaseUrl;

  static String _getBaseUrl() {
    if (Platform.isAndroid) {
      // Use 10.0.2.2 for Android Emulator to connect to host localhost
      return 'http://10.0.2.2:8080/api';
    } else if (Platform.isIOS) {
      // iOS Simulator usually works with localhost
      return 'http://localhost:8080/api';
    } else {
      // Default for other platforms (web, desktop - might need adjustment)
      return 'http://localhost:8080/api';
    }
  }
}
