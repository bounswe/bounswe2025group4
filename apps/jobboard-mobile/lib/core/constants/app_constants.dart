class AppConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://jobboard-backend-dev-728855696411.europe-west1.run.app/api',
  );
  static const String baseWsUrl = String.fromEnvironment(
    'API_BASE_WS_URL',
    defaultValue: 'wss://jobboard-backend-dev-728855696411.europe-west1.run.app/',
  );
}
