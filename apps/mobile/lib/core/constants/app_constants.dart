import 'dart:io' show Platform;

class AppConstants {
  static final String _devBaseUrl = _getBaseUrl();

  static String get baseUrl => _devBaseUrl;

  static String _getBaseUrl() {
    return 'https://bounswe2025group4-327739565032.europe-west1.run.app/api';
  }
}
