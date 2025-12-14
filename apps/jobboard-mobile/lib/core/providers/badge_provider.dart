import 'package:flutter/foundation.dart';
import '../models/badge.dart';
import '../services/api_service.dart';

class BadgeProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Badge> _earnedBadges = [];
  List<BadgeTypeInfo> _allBadgeTypes = [];
  bool _isLoading = false;
  String? _error;

  BadgeProvider(this._apiService);

  List<Badge> get earnedBadges => _earnedBadges;
  List<BadgeTypeInfo> get allBadgeTypes => _allBadgeTypes;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Get badges grouped by category
  Map<BadgeCategory, List<Badge>> get badgesByCategory {
    final Map<BadgeCategory, List<Badge>> grouped = {
      BadgeCategory.FORUM: [],
      BadgeCategory.JOB_POST: [],
      BadgeCategory.JOB_APPLICATION: [],
      BadgeCategory.MENTORSHIP: [],
    };

    for (var badge in _earnedBadges) {
      grouped[badge.category]?.add(badge);
    }

    return grouped;
  }

  /// Get all badges (earned + unearned) grouped by category
  Map<BadgeCategory, List<BadgeDisplay>> get allBadgesGrouped {
    final Map<BadgeCategory, List<BadgeDisplay>> grouped = {
      BadgeCategory.FORUM: [],
      BadgeCategory.JOB_POST: [],
      BadgeCategory.JOB_APPLICATION: [],
      BadgeCategory.MENTORSHIP: [],
    };

    // Create a map of earned badges by type
    final Map<String, Badge> earnedMap = {
      for (var badge in _earnedBadges) badge.badgeType: badge
    };

    // Add all badge types, marking which are earned
    for (var badgeType in _allBadgeTypes) {
      final earnedBadge = earnedMap[badgeType.name];
      grouped[badgeType.category]?.add(
        BadgeDisplay(
          badgeType: badgeType,
          earnedBadge: earnedBadge,
        ),
      );
    }

    return grouped;
  }

  /// Fetch current user's badges
  Future<void> fetchMyBadges() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _earnedBadges = await _apiService.getMyBadges();
      _error = null;
    } catch (e) {
      _error = e.toString();
      print('Error fetching badges: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch all badge types
  Future<void> fetchBadgeTypes() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _allBadgeTypes = await _apiService.getBadgeTypes();
      _error = null;
    } catch (e) {
      _error = e.toString();
      print('Error fetching badge types: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch user's badges by user ID
  Future<List<Badge>> fetchUserBadges(int userId) async {
    try {
      return await _apiService.getUserBadges(userId);
    } catch (e) {
      print('Error fetching user badges: $e');
      return [];
    }
  }

  /// Fetch all badge data (both earned and types)
  Future<void> fetchAllBadgeData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.wait([
        _apiService.getMyBadges().then((badges) => _earnedBadges = badges),
        _apiService.getBadgeTypes().then((types) => _allBadgeTypes = types),
      ]);
      _error = null;
    } catch (e) {
      _error = e.toString();
      print('Error fetching badge data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

/// Helper class to display badge information (earned or unearned)
class BadgeDisplay {
  final BadgeTypeInfo badgeType;
  final Badge? earnedBadge;

  BadgeDisplay({
    required this.badgeType,
    this.earnedBadge,
  });

  bool get isEarned => earnedBadge != null;
  String get name => badgeType.name;
  String get description => badgeType.description;
  BadgeCategory get category => badgeType.category;
  int get threshold => badgeType.threshold;
  DateTime? get awardedAt => earnedBadge?.awardedAt;
}
