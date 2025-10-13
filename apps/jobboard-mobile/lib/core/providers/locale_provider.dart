import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider with ChangeNotifier {
  Locale _locale = const Locale('en');
  static const String _localePreferenceKey = 'app_locale';

  Locale get locale => _locale;

  // Supported locales following BCP 47 standards
  static const List<Locale> supportedLocales = [
    Locale('en'), // English
    Locale('tr'), // Turkish
    Locale('ar'), // Arabic (for RTL support)
  ];

  LocaleProvider() {
    _loadLocaleFromPreferences();
  }

  // Load saved locale from SharedPreferences
  Future<void> _loadLocaleFromPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final localeCode = prefs.getString(_localePreferenceKey);
    
    if (localeCode != null) {
      final savedLocale = Locale(localeCode);
      if (supportedLocales.contains(savedLocale)) {
        _locale = savedLocale;
        notifyListeners();
      }
    }
  }

  // Set new locale and persist it
  Future<void> setLocale(Locale locale) async {
    if (!supportedLocales.contains(locale)) {
      return;
    }

    _locale = locale;
    notifyListeners();

    // Persist the locale preference
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localePreferenceKey, locale.languageCode);
  }

  // Clear locale preference (will default to system locale)
  Future<void> clearLocale() async {
    _locale = const Locale('en'); // Default to English
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_localePreferenceKey);
  }

  // Get locale display name in the locale's own language
  String getLocaleDisplayName(Locale locale) {
    switch (locale.languageCode) {
      case 'en':
        return 'English';
      case 'tr':
        return 'Türkçe';
      case 'ar':
        return 'العربية';
      default:
        return locale.languageCode;
    }
  }

  // Check if current locale is RTL
  bool get isRTL => _locale.languageCode == 'ar';
}

