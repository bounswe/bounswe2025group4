import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/font_size_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('FontSizeProvider Unit Tests', () {
    setUp(() {
      // Set up mock SharedPreferences before each test
      SharedPreferences.setMockInitialValues({});
    });

    test('should start with medium font size by default', () async {
      // Act
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50)); // Wait for init

      // Assert initial state
      expect(fontSizeProvider.currentFontSize, equals(FontSizeOption.medium));
      expect(fontSizeProvider.fontSizeMultiplier, equals(1.0));
    });

    test('should return correct multiplier for small font size', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act
      await fontSizeProvider.setFontSize(FontSizeOption.small);

      // Assert
      expect(fontSizeProvider.currentFontSize, equals(FontSizeOption.small));
      expect(fontSizeProvider.fontSizeMultiplier, equals(0.9));
    });

    test('should return correct multiplier for medium font size', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act
      await fontSizeProvider.setFontSize(FontSizeOption.medium);

      // Assert
      expect(fontSizeProvider.currentFontSize, equals(FontSizeOption.medium));
      expect(fontSizeProvider.fontSizeMultiplier, equals(1.0));
    });

    test('should return correct multiplier for large font size', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act
      await fontSizeProvider.setFontSize(FontSizeOption.large);

      // Assert
      expect(fontSizeProvider.currentFontSize, equals(FontSizeOption.large));
      expect(fontSizeProvider.fontSizeMultiplier, equals(1.15));
    });

    test('should correctly scale font size with multiplier', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      const baseSize = 16.0;

      // Test small
      await fontSizeProvider.setFontSize(FontSizeOption.small);
      expect(
        fontSizeProvider.getScaledFontSize(baseSize),
        equals(baseSize * 0.9),
      );

      // Test medium
      await fontSizeProvider.setFontSize(FontSizeOption.medium);
      expect(
        fontSizeProvider.getScaledFontSize(baseSize),
        equals(baseSize * 1.0),
      );

      // Test large
      await fontSizeProvider.setFontSize(FontSizeOption.large);
      expect(
        fontSizeProvider.getScaledFontSize(baseSize),
        equals(baseSize * 1.15),
      );
    });

    test('should persist font size to SharedPreferences', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act
      await fontSizeProvider.setFontSize(FontSizeOption.large);
      await Future.delayed(const Duration(milliseconds: 50)); // Wait for save

      // Assert
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('selectedFontSize'), equals('large'));
    });

    test('should load saved font size from SharedPreferences', () async {
      // Arrange - Save a font size first
      SharedPreferences.setMockInitialValues({'selectedFontSize': 'large'});

      // Act - Create new provider (should load saved size)
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(
        const Duration(milliseconds: 100),
      ); // Wait for async load

      // Assert
      expect(fontSizeProvider.currentFontSize, equals(FontSizeOption.large));
      expect(fontSizeProvider.fontSizeMultiplier, equals(1.15));
    });

    test('should not change font size if setting same value', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      await fontSizeProvider.setFontSize(FontSizeOption.large);

      final sizeBefore = fontSizeProvider.currentFontSize;

      // Act - Set same value again
      await fontSizeProvider.setFontSize(FontSizeOption.large);

      // Assert - Should remain the same
      expect(fontSizeProvider.currentFontSize, equals(sizeBefore));
    });

    test('should scale TextStyle correctly', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      await fontSizeProvider.setFontSize(FontSizeOption.small);

      const baseStyle = TextStyle(fontSize: 20.0);

      // Act
      final scaledStyle = fontSizeProvider.getScaledTextStyle(baseStyle);

      // Assert
      expect(scaledStyle.fontSize, equals(20.0 * 0.9));
    });

    test('should handle TextStyle without fontSize', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      const baseStyle = TextStyle(color: Colors.blue);

      // Act
      final scaledStyle = fontSizeProvider.getScaledTextStyle(baseStyle);

      // Assert - Should return same style if no fontSize
      expect(scaledStyle.fontSize, isNull);
      expect(scaledStyle.color, equals(Colors.blue));
    });

    test('should handle all font size options', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Test all enum values
      final options = [
        FontSizeOption.small,
        FontSizeOption.medium,
        FontSizeOption.large,
      ];

      for (final option in options) {
        // Act
        await fontSizeProvider.setFontSize(option);

        // Assert
        expect(fontSizeProvider.currentFontSize, equals(option));
        expect(fontSizeProvider.fontSizeMultiplier, greaterThan(0));
      }
    });

    test('should maintain correct multiplier mapping', () {
      // Create a fresh provider
      final fontSizeProvider = FontSizeProvider();

      // Manually set and verify (without async loading)
      final multipliers = {
        FontSizeOption.small: 0.9,
        FontSizeOption.medium: 1.0,
        FontSizeOption.large: 1.15,
      };

      for (final entry in multipliers.entries) {
        fontSizeProvider.setFontSize(entry.key);
        expect(
          fontSizeProvider.fontSizeMultiplier,
          equals(entry.value),
          reason: 'Multiplier for ${entry.key} should be ${entry.value}',
        );
      }
    });

    test('should scale various base font sizes correctly', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      await fontSizeProvider.setFontSize(FontSizeOption.large);

      final baseSizes = [12.0, 14.0, 16.0, 18.0, 20.0, 24.0];

      // Act & Assert
      for (final baseSize in baseSizes) {
        final scaled = fontSizeProvider.getScaledFontSize(baseSize);
        expect(scaled, equals(baseSize * 1.15));
      }
    });

    test('should persist and load small font size', () async {
      // Arrange - Set and persist small font
      final fontSizeProvider1 = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));
      await fontSizeProvider1.setFontSize(FontSizeOption.small);
      await Future.delayed(const Duration(milliseconds: 50));

      // Act - Create new provider to simulate app restart
      final fontSizeProvider2 = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 100)); // Wait for load

      // Assert
      expect(fontSizeProvider2.currentFontSize, equals(FontSizeOption.small));
      expect(fontSizeProvider2.fontSizeMultiplier, equals(0.9));
    });

    test(
      'getScaledTextStyle should preserve other TextStyle properties',
      () async {
        // Arrange
        final fontSizeProvider = FontSizeProvider();
        await Future.delayed(const Duration(milliseconds: 50));
        await fontSizeProvider.setFontSize(FontSizeOption.large);

        const baseStyle = TextStyle(
          fontSize: 16.0,
          color: Colors.red,
          fontWeight: FontWeight.bold,
          fontStyle: FontStyle.italic,
        );

        // Act
        final scaledStyle = fontSizeProvider.getScaledTextStyle(baseStyle);

        // Assert
        expect(scaledStyle.fontSize, equals(16.0 * 1.15));
        expect(scaledStyle.color, equals(Colors.red));
        expect(scaledStyle.fontWeight, equals(FontWeight.bold));
        expect(scaledStyle.fontStyle, equals(FontStyle.italic));
      },
    );

    test('should handle rapid font size changes', () async {
      // Arrange
      final fontSizeProvider = FontSizeProvider();
      await Future.delayed(const Duration(milliseconds: 50));

      // Act - Rapidly change font sizes
      await fontSizeProvider.setFontSize(FontSizeOption.small);
      await fontSizeProvider.setFontSize(FontSizeOption.large);
      await fontSizeProvider.setFontSize(FontSizeOption.medium);
      await fontSizeProvider.setFontSize(FontSizeOption.large);

      // Assert - Should be at the last set value
      expect(fontSizeProvider.currentFontSize, equals(FontSizeOption.large));
      expect(fontSizeProvider.fontSizeMultiplier, equals(1.15));
    });

    test('FontSizeOption enum should have three values', () {
      expect(FontSizeOption.values.length, equals(3));
      expect(
        FontSizeOption.values,
        containsAll([
          FontSizeOption.small,
          FontSizeOption.medium,
          FontSizeOption.large,
        ]),
      );
    });
  });
}
