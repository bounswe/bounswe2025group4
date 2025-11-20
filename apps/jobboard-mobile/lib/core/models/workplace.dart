import 'workplace_review.dart';
import 'workplace_employer.dart';

/// Model for workplace/company information
class Workplace {
  final int id;
  final String companyName;
  final String? imageUrl;
  final String sector;
  final String location;
  final String shortDescription;
  final String detailedDescription;
  final String? website;
  final List<String> ethicalTags;
  final double? overallAvg;
  final Map<String, double> ethicalAverages;
  final List<WorkplaceReview> recentReviews;
  final List<WorkplaceEmployer> employers;
  final DateTime createdAt;
  final DateTime updatedAt;

  Workplace({
    required this.id,
    required this.companyName,
    this.imageUrl,
    required this.sector,
    required this.location,
    required this.shortDescription,
    required this.detailedDescription,
    this.website,
    required this.ethicalTags,
    required this.overallAvg,
    required this.ethicalAverages,
    required this.recentReviews,
    required this.employers,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Workplace.fromJson(Map<String, dynamic> json) {
    return Workplace(
      id: json['id'] as int,
      companyName: json['companyName'] as String,
      imageUrl: json['imageUrl'] as String?,
      sector: json['sector'] as String,
      location: json['location'] as String,
      shortDescription: json['shortDescription'] as String,
      detailedDescription: json['detailedDescription'] as String,
      website: json['website'] as String?,
      ethicalTags: List<String>.from(json['ethicalTags'] as List? ?? []),
      overallAvg: (json['overallAvg'] as num?)?.toDouble(),
      ethicalAverages:
          json['ethicalAverages'] != null
              ? Map<String, double>.from(
                (json['ethicalAverages'] as Map<String, dynamic>).map(
                  (key, value) =>
                      MapEntry(key, (value as num?)?.toDouble() ?? 0.0),
                ),
              )
              : {},
      recentReviews:
          json['recentReviews'] != null
              ? (json['recentReviews'] as List)
                  .map(
                    (e) => WorkplaceReview.fromJson(e as Map<String, dynamic>),
                  )
                  .toList()
              : [],
      employers:
          json['employers'] != null
              ? (json['employers'] as List)
                  .map(
                    (e) =>
                        WorkplaceEmployer.fromJson(e as Map<String, dynamic>),
                  )
                  .toList()
              : [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'companyName': companyName,
      if (imageUrl != null) 'imageUrl': imageUrl,
      'sector': sector,
      'location': location,
      'shortDescription': shortDescription,
      'detailedDescription': detailedDescription,
      if (website != null) 'website': website,
      'ethicalTags': ethicalTags,
      'overallAvg': overallAvg,
      'ethicalAverages': ethicalAverages,
      'recentReviews': recentReviews.map((e) => e.toJson()).toList(),
      'employers': employers.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Helper method to check if current user is owner or manager
  bool isUserAuthorized(int userId) {
    return employers.any((e) => e.userId == userId);
  }

  /// Helper method to check if current user is owner
  bool isUserOwner(int userId) {
    return employers.any(
      (e) => e.userId == userId && e.role.toUpperCase() == 'OWNER',
    );
  }

  /// Helper method to get user's role in workplace
  String? getUserRole(int userId) {
    final employer = employers.firstWhere(
      (e) => e.userId == userId,
      orElse:
          () => WorkplaceEmployer(
            userId: -1,
            username: '',
            email: '',
            role: '',
            joinedAt: DateTime.now(),
          ),
    );
    return employer.userId == -1 ? null : employer.role;
  }
}
