import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart'; // Adjust path
import 'core/providers/quote_provider.dart'; // Add QuoteProvider import
import 'core/services/api_service.dart';
import 'app.dart'; // Adjust path

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => AuthProvider()),
        ChangeNotifierProvider(
          create: (context) => QuoteProvider(),
        ), // Add QuoteProvider
        ProxyProvider<AuthProvider, ApiService>(
          update:
              (context, authProvider, _) =>
                  ApiService(authProvider: authProvider),
        ),
      ],
      child: const MyApp(),
    ),
  );
}
