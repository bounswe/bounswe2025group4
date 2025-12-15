import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart'; // Adjust path
import 'core/providers/theme_provider.dart';
import 'core/providers/quote_provider.dart';
import 'core/providers/profile_provider.dart';
import 'core/providers/font_size_provider.dart';
import 'core/providers/locale_provider.dart';
import 'core/providers/notification_provider.dart';
import 'core/providers/tab_navigation_provider.dart';
import 'core/services/api_service.dart';
import 'core/services/notification_websocket_service.dart';
import 'features/mentorship/providers/mentor_provider.dart';
import 'features/mentorship/providers/chat_provider.dart';
import 'features/mentorship/services/stomp_chat_service.dart';
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
        ChangeNotifierProvider(create: (context) => TabNavigationProvider()),
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

        Provider(
          create: (_) => StompChatService(),
        ),

        ChangeNotifierProvider<ChatProvider>(
          create: (context) => ChatProvider(
            chatService: context.read<StompChatService>(),
            apiService: context.read<ApiService>(),
          ),
        ),

        // Notification WebSocket Service (singleton)
        Provider<NotificationWebSocketService>(
          create: (context) => NotificationWebSocketService(),
          dispose: (context, service) => service.dispose(),
        ),

        // Notification Provider
        ChangeNotifierProxyProvider2<ApiService, NotificationWebSocketService,
            NotificationProvider>(
          create: (context) => NotificationProvider(
            apiService: Provider.of<ApiService>(context, listen: false),
            webSocketService: Provider.of<NotificationWebSocketService>(
              context,
              listen: false,
            ),
          ),
          update: (context, apiService, webSocketService, previous) {
            if (previous != null) {
              return previous;
            }
            return NotificationProvider(
              apiService: apiService,
              webSocketService: webSocketService,
            );
          },
        ),

      ],
      child: const MyApp(),
    ),
  );
}
