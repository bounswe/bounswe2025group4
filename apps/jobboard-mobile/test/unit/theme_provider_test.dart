import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/theme_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ThemeProvider Unit Tests', () {
    late ThemeProvider themeProvider;

    setUp(() {
      themeProvider = ThemeProvider();
    });

    test('should start with system theme mode by default', () {
      // Assert initial state
      expect(themeProvider.themeMode, equals(ThemeMode.system));
      expect(themeProvider.isDarkMode, isFalse);
    });

    test('should toggle to dark mode when isOn is true', () {
      // Arrange
      expect(themeProvider.themeMode, equals(ThemeMode.system));

      // Act
      themeProvider.toggleTheme(true);

      // Assert
      expect(themeProvider.themeMode, equals(ThemeMode.dark));
      expect(themeProvider.isDarkMode, isTrue);
    });

    test('should toggle to light mode when isOn is false', () {
      // Arrange
      themeProvider.toggleTheme(true); // First set to dark

      // Act
      themeProvider.toggleTheme(false);

      // Assert
      expect(themeProvider.themeMode, equals(ThemeMode.light));
      expect(themeProvider.isDarkMode, isFalse);
    });

    test('should set theme mode directly', () {
      // Act & Assert - Set to dark
      themeProvider.setThemeMode(ThemeMode.dark);
      expect(themeProvider.themeMode, equals(ThemeMode.dark));
      expect(themeProvider.isDarkMode, isTrue);

      // Act & Assert - Set to light
      themeProvider.setThemeMode(ThemeMode.light);
      expect(themeProvider.themeMode, equals(ThemeMode.light));
      expect(themeProvider.isDarkMode, isFalse);

      // Act & Assert - Set to system
      themeProvider.setThemeMode(ThemeMode.system);
      expect(themeProvider.themeMode, equals(ThemeMode.system));
      expect(themeProvider.isDarkMode, isFalse);
    });

    test('isDarkMode should return true only when theme is dark', () {
      // System mode
      themeProvider.setThemeMode(ThemeMode.system);
      expect(themeProvider.isDarkMode, isFalse);

      // Light mode
      themeProvider.setThemeMode(ThemeMode.light);
      expect(themeProvider.isDarkMode, isFalse);

      // Dark mode
      themeProvider.setThemeMode(ThemeMode.dark);
      expect(themeProvider.isDarkMode, isTrue);
    });

    test('should handle multiple theme toggles correctly', () {
      // Toggle on
      themeProvider.toggleTheme(true);
      expect(themeProvider.themeMode, equals(ThemeMode.dark));

      // Toggle off
      themeProvider.toggleTheme(false);
      expect(themeProvider.themeMode, equals(ThemeMode.light));

      // Toggle on again
      themeProvider.toggleTheme(true);
      expect(themeProvider.themeMode, equals(ThemeMode.dark));

      // Toggle off again
      themeProvider.toggleTheme(false);
      expect(themeProvider.themeMode, equals(ThemeMode.light));
    });

    test('should maintain consistency between themeMode and isDarkMode', () {
      // Test all theme modes
      final modes = [ThemeMode.system, ThemeMode.light, ThemeMode.dark];

      for (final mode in modes) {
        themeProvider.setThemeMode(mode);
        expect(
          themeProvider.isDarkMode,
          equals(mode == ThemeMode.dark),
          reason: 'isDarkMode should match themeMode for $mode',
        );
      }
    });

    test('toggleTheme should be idempotent with same value', () {
      // Toggle to dark twice
      themeProvider.toggleTheme(true);
      final firstMode = themeProvider.themeMode;
      themeProvider.toggleTheme(true);
      final secondMode = themeProvider.themeMode;

      expect(firstMode, equals(secondMode));
      expect(secondMode, equals(ThemeMode.dark));
    });

    test('setThemeMode should accept all ThemeMode values', () {
      // Test that all enum values are accepted
      expect(() => themeProvider.setThemeMode(ThemeMode.system), returnsNormally);
      expect(() => themeProvider.setThemeMode(ThemeMode.light), returnsNormally);
      expect(() => themeProvider.setThemeMode(ThemeMode.dark), returnsNormally);
    });

    test('should start with isDarkMode as false', () {
      final freshProvider = ThemeProvider();
      expect(freshProvider.isDarkMode, isFalse);
    });
  });
}
