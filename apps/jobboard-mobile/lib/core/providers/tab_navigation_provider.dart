import 'package:flutter/foundation.dart';

/// Provider for managing tab navigation in MainScaffold
class TabNavigationProvider extends ChangeNotifier {
  int _selectedIndex = 1; // Default to Job tab

  int get selectedIndex => _selectedIndex;

  /// Change the selected tab index
  void changeTab(int index) {
    if (_selectedIndex != index) {
      _selectedIndex = index;
      notifyListeners();
    }
  }
}

