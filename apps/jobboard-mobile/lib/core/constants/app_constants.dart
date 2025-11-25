class AppConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://jobboard-backend-728855696411.europe-west1.run.app/api',
  );
}
