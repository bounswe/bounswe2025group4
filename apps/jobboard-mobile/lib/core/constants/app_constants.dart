import 'dart:io' show Platform;

class AppConstants {
  static final String _devBaseUrl = _getBaseUrl();

  static String get baseUrl => _devBaseUrl;

  static String _getBaseUrl() {
    //return 'https://jobboard-backend-728855696411.europe-west1.run.app/';
    return 'https://jobboard-backend-test-728855696411.europe-west1.run.app/api';
    //return 'http://localhost:8080/api';
    //return 'http://10.0.2.2:8080/api';
  }
}
