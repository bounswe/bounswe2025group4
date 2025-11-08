/// Model for workplace item in employer's list (with role and review count)
class EmployerWorkplaceItem {
  final String role;
  final EmployerWorkplace workplace;

  EmployerWorkplaceItem({
    required this.role,
    required this.workplace,
  });

  factory EmployerWorkplaceItem.fromJson(Map<String, dynamic> json) {
    return EmployerWorkplaceItem(
      role: json['role'] as String,
      workplace: EmployerWorkplace.fromJson(json['workplace'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'workplace': workplace.toJson(),
    };
  }
}

/// Workplace model with review count (used in employer's workplace list)
class EmployerWorkplace {
  final int id;
  final String companyName;
  final String? imageUrl;
  final String sector;
  final String location;
  final String shortDescription;
  final double overallAvg;
  final List<String> ethicalTags;
  final Map<String, double> ethicalAverages;
  final int reviewCount;

  EmployerWorkplace({
    required this.id,
    required this.companyName,
    this.imageUrl,
    required this.sector,
    required this.location,
    required this.shortDescription,
    required this.overallAvg,
    required this.ethicalTags,
    required this.ethicalAverages,
    required this.reviewCount,
  });

  factory EmployerWorkplace.fromJson(Map<String, dynamic> json) {
    return EmployerWorkplace(
      id: json['id'] as int,
      companyName: json['companyName'] as String,
      imageUrl: json['imageUrl'] as String?,
      sector: json['sector'] as String,
      location: json['location'] as String,
      shortDescription: json['shortDescription'] as String,
      overallAvg: (json['overallAvg'] as num?)?.toDouble() ?? 0.0,
      ethicalTags: List<String>.from(json['ethicalTags'] as List? ?? []),
      ethicalAverages: json['ethicalAverages'] != null
          ? Map<String, double>.from(
              (json['ethicalAverages'] as Map<String, dynamic>).map(
                (key, value) => MapEntry(key, (value as num?)?.toDouble() ?? 0.0),
              ),
            )
          : {},
      reviewCount: json['reviewCount'] as int? ?? 0,
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
      'overallAvg': overallAvg,
      'ethicalTags': ethicalTags,
      'ethicalAverages': ethicalAverages,
      'reviewCount': reviewCount,
    };
  }
}

