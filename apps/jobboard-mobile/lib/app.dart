import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'generated/l10n/app_localizations.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/font_size_provider.dart';
import 'core/providers/locale_provider.dart';
import 'core/providers/theme_provider.dart';
import 'features/auth/screens/welcome_screen.dart';
import 'features/main_scaffold/main_scaffold.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer3<FontSizeProvider, LocaleProvider, ThemeProvider>(
      builder: (context, fontSizeProvider, localeProvider, themeProvider, child) {
        return MaterialApp(
          title: 'EthicaJobs',
          
          // Localization configuration
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: LocaleProvider.supportedLocales,
          locale: localeProvider.locale,
          localeResolutionCallback: (locale, supportedLocales) {
            // Check if the current device locale is supported
            if (locale != null) {
              for (var supportedLocale in supportedLocales) {
                if (supportedLocale.languageCode == locale.languageCode) {
                  return supportedLocale;
                }
              }
            }
            // If not supported, return the first supported locale (English)
            return supportedLocales.first;
          },

          themeMode: themeProvider.themeMode,
          theme: ThemeData(
            brightness: Brightness.light,
            primarySwatch: Colors.blue,
            primaryColor: Colors.blue,
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.blue,
              primary: Colors.blue,
              secondary: Colors.blue,
            ),
            floatingActionButtonTheme: const FloatingActionButtonThemeData(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
            progressIndicatorTheme: const ProgressIndicatorThemeData(
              color: Colors.blue,
              circularTrackColor: Colors.transparent,
            ),
            visualDensity: VisualDensity.adaptivePlatformDensity,
            textTheme: ThemeData.light().textTheme.copyWith(
              bodyLarge: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(16),
              ),
              bodyMedium: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(14),
              ),
              bodySmall: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(12),
              ),
              titleLarge: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(22),
              ),
              titleMedium: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(18),
              ),
              titleSmall: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(16),
              ),
            ),
          ),
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            primarySwatch: Colors.blue,
            primaryColor: Colors.blue,
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.blue,
              primary: Colors.blue,
              secondary: Colors.blue,
              brightness: Brightness.dark,
            ),
            floatingActionButtonTheme: const FloatingActionButtonThemeData(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
            progressIndicatorTheme: const ProgressIndicatorThemeData(
              color: Colors.blue,
              circularTrackColor: Colors.transparent,
            ),
            visualDensity: VisualDensity.adaptivePlatformDensity,
            textTheme: ThemeData.dark().textTheme.copyWith(
              bodyLarge: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(16),
              ),
              bodyMedium: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(14),
              ),
              bodySmall: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(12),
              ),
              titleLarge: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(22),
              ),
              titleMedium: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(18),
              ),
              titleSmall: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(16),
              ),
            ),
          ),
          home: Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              if (authProvider.isLoggedIn) {
                return const MainScaffold();
              } else {
                return const WelcomeScreen();
              }
            },
          ),
        );
      },
    );
  }
}
