import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart'; // Adjust path
import 'core/providers/theme_provider.dart';
import 'core/providers/quote_provider.dart';
import 'core/providers/profile_provider.dart';
import 'core/providers/font_size_provider.dart';
import 'core/providers/locale_provider.dart';
import 'core/services/api_service.dart';
import 'features/mentorship/providers/mentor_provider.dart';
import 'app.dart'; // Adjust path

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => AuthProvider()),
        ChangeNotifierProvider(
          create: (context) => QuoteProvider(),
        ), // Add QuoteProvider
        ChangeNotifierProvider(create: (context) => FontSizeProvider()),
        ChangeNotifierProvider(create: (context) => LocaleProvider()),
        ChangeNotifierProvider(create: (context) => ThemeProvider()),
        ProxyProvider<AuthProvider, ApiService>(
          update:
              (context, authProvider, _) =>
                  ApiService(authProvider: authProvider),
        ),
        ChangeNotifierProxyProvider<ApiService, ProfileProvider>(
          create:
              (context) => ProfileProvider(
                apiService: ApiService(
                  authProvider: Provider.of<AuthProvider>(
                    context,
                    listen: false,
                  ),
                ),
              ),
          update:
              (context, apiService, previous) =>
                  previous!..updateApiService(apiService),
        ),

        ChangeNotifierProxyProvider<ApiService, MentorProvider>(
          create: (context) => MentorProvider(
            apiService: Provider.of<ApiService>(context, listen: false),
          ),
          update: (context, apiService, previous) =>
          previous!..updateApiService(apiService),
        ),

      ],
      child: const MyApp(),
    ),
  );
}
