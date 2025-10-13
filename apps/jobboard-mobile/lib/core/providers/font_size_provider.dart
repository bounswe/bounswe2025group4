import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum FontSizeOption { small, medium, large }

class FontSizeProvider with ChangeNotifier {
  FontSizeOption _currentFontSize = FontSizeOption.medium;
  static const String _fontSizeKey = 'selectedFontSize';

  FontSizeProvider() {
    _loadFontSize();
  }

  FontSizeOption get currentFontSize => _currentFontSize;

  // Get multiplier for font sizes
  double get fontSizeMultiplier {
    switch (_currentFontSize) {
      case FontSizeOption.small:
        return 0.9;
      case FontSizeOption.medium:
        return 1.0;
      case FontSizeOption.large:
        return 1.15;
    }
  }

  // Load saved font size from SharedPreferences
  Future<void> _loadFontSize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedSize = prefs.getString(_fontSizeKey);
      if (savedSize != null) {
        _currentFontSize = FontSizeOption.values.byName(savedSize);
        notifyListeners();
      }
    } catch (e) {
      print('Error loading font size: $e');
    }
  }

  // Update font size and save to SharedPreferences
  Future<void> setFontSize(FontSizeOption size) async {
    if (_currentFontSize == size) return;

    _currentFontSize = size;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_fontSizeKey, size.name);
      print('Font size saved: ${size.name}');
    } catch (e) {
      print('Error saving font size: $e');
    }
  }

  // Helper method to get scaled font size
  double getScaledFontSize(double baseSize) {
    return baseSize * fontSizeMultiplier;
  }

  // Helper method to get TextStyle with scaled font size
  TextStyle getScaledTextStyle(TextStyle baseStyle) {
    if (baseStyle.fontSize == null) {
      return baseStyle;
    }
    return baseStyle.copyWith(
      fontSize: baseStyle.fontSize! * fontSizeMultiplier,
    );
  }
}
