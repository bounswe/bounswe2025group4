// lib/core/utils/string_extensions.dart

extension StringExtension on String {
  /// Capitalizes the first letter of the string.
  String capitalizeFirst() {
    if (isEmpty) return "";
    return "${this[0].toUpperCase()}${substring(1)}";
  }

  /// Formats a snake_case or similar string for display
  /// (e.g., 'fair_wage' -> 'Fair wage').
  String formatFilterName() {
    return replaceAll('_', ' ').capitalizeFirst();
  }
}
