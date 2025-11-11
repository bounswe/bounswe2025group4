import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/locale_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LocaleProvider Unit Tests', () {
    setUp(() {
      // Set up mock SharedPreferences before each test
      SharedPreferences.setMockInitialValues({});
    });

    test('should start with English locale by default', () {
      // Act
      final localeProvider = LocaleProvider();

      // Assert initial state
      expect(localeProvider.locale, equals(const Locale('en')));
      expect(localeProvider.isRTL, isFalse);
    });

    test('should have correct supported locales', () {
      // Assert
      expect(LocaleProvider.supportedLocales, hasLength(3));
      expect(
        LocaleProvider.supportedLocales,
        containsAll([
          const Locale('en'),
          const Locale('tr'),
          const Locale('ar'),
        ]),
      );
    });

    test('should set locale to Turkish', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50)); // Wait for init

      // Act
      await localeProvider.setLocale(const Locale('tr'));

      // Assert
      expect(localeProvider.locale, equals(const Locale('tr')));
      expect(localeProvider.isRTL, isFalse);
    });

    test('should set locale to Arabic and detect RTL', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act
      await localeProvider.setLocale(const Locale('ar'));

      // Assert
      expect(localeProvider.locale, equals(const Locale('ar')));
      expect(localeProvider.isRTL, isTrue);
    });

    test('should persist locale to SharedPreferences', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act
      await localeProvider.setLocale(const Locale('tr'));

      // Assert
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('app_locale'), equals('tr'));
    });

    test('should load saved locale from SharedPreferences', () async {
      // Arrange - Save a locale first
      SharedPreferences.setMockInitialValues({'app_locale': 'ar'});

      // Act - Create new provider (should load saved locale)
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 100)); // Wait for async load

      // Assert
      expect(localeProvider.locale, equals(const Locale('ar')));
    });

    test('should not set unsupported locale', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      final originalLocale = localeProvider.locale;

      // Act - Try to set unsupported locale
      await localeProvider.setLocale(const Locale('fr')); // French not supported

      // Assert - Should remain unchanged
      expect(localeProvider.locale, equals(originalLocale));
    });

    test('should clear locale and reset to English', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      await localeProvider.setLocale(const Locale('tr'));
      expect(localeProvider.locale, equals(const Locale('tr')));

      // Act
      await localeProvider.clearLocale();

      // Assert
      expect(localeProvider.locale, equals(const Locale('en')));

      // Verify it was removed from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.containsKey('app_locale'), isFalse);
    });

    test('should return correct locale display names', () {
      // Arrange
      final localeProvider = LocaleProvider();

      // Assert
      expect(
        localeProvider.getLocaleDisplayName(const Locale('en')),
        equals('English'),
      );
      expect(
        localeProvider.getLocaleDisplayName(const Locale('tr')),
        equals('Türkçe'),
      );
      expect(
        localeProvider.getLocaleDisplayName(const Locale('ar')),
        equals('العربية'),
      );
    });

    test('should return language code for unknown locales', () {
      // Arrange
      final localeProvider = LocaleProvider();

      // Act & Assert
      expect(
        localeProvider.getLocaleDisplayName(const Locale('de')),
        equals('de'),
      );
    });

    test('isRTL should return true only for Arabic', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Test English
      await localeProvider.setLocale(const Locale('en'));
      expect(localeProvider.isRTL, isFalse);

      // Test Turkish
      await localeProvider.setLocale(const Locale('tr'));
      expect(localeProvider.isRTL, isFalse);

      // Test Arabic
      await localeProvider.setLocale(const Locale('ar'));
      expect(localeProvider.isRTL, isTrue);
    });

    test('should handle multiple locale changes', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act & Assert - Chain of locale changes
      await localeProvider.setLocale(const Locale('tr'));
      expect(localeProvider.locale.languageCode, 'tr');

      await localeProvider.setLocale(const Locale('ar'));
      expect(localeProvider.locale.languageCode, 'ar');

      await localeProvider.setLocale(const Locale('en'));
      expect(localeProvider.locale.languageCode, 'en');

      await localeProvider.setLocale(const Locale('ar'));
      expect(localeProvider.locale.languageCode, 'ar');
    });

    test('should persist and load Turkish locale', () async {
      // Arrange - Set and persist Turkish
      final localeProvider1 = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      await localeProvider1.setLocale(const Locale('tr'));

      // Act - Create new provider to simulate app restart
      final localeProvider2 = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 100)); // Wait for load

      // Assert
      expect(localeProvider2.locale, equals(const Locale('tr')));
    });

    test('should handle setting same locale multiple times', () async {
      // Arrange
      final localeProvider = LocaleProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act - Set same locale multiple times
      await localeProvider.setLocale(const Locale('tr'));
      final firstLocale = localeProvider.locale;

      await localeProvider.setLocale(const Locale('tr'));
      final secondLocale = localeProvider.locale;

      // Assert
      expect(firstLocale, equals(secondLocale));
      expect(secondLocale, equals(const Locale('tr')));
    });

    test('supported locales should be constant', () {
      // Verify supported locales list doesn't change
      final locales1 = LocaleProvider.supportedLocales;
      final locales2 = LocaleProvider.supportedLocales;

      expect(locales1, equals(locales2));
      expect(locales1.length, equals(3));
    });
  });
}
