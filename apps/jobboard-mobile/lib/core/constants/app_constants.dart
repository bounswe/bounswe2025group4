import 'dart:io' show Platform;

class AppConstants {
  static final String _devBaseUrl = _getBaseUrl();

  static String get baseUrl => _devBaseUrl;

  static String _getBaseUrl() {
    return 'https://jobboard-backend-dev-728855696411.europe-west1.run.app/api';
  }
}
