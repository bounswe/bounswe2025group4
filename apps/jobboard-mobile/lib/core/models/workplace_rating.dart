/// Model for workplace rating information
class WorkplaceRating {
  final int workplaceId;
  final double? overallAvg;
  final Map<String, double> ethicalAverages;

  WorkplaceRating({
    required this.workplaceId,
    required this.overallAvg,
    required this.ethicalAverages,
  });

  factory WorkplaceRating.fromJson(Map<String, dynamic> json) {
    return WorkplaceRating(
      workplaceId: json['workplaceId'] as int,
      overallAvg: (json['overallAvg'] as num?)?.toDouble(),
      ethicalAverages: Map<String, double>.from(
        (json['ethicalAverages'] as Map<String, dynamic>).map(
          (key, value) => MapEntry(key, (value as num).toDouble()),
        ),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'workplaceId': workplaceId,
      'overallAvg': overallAvg,
      'ethicalAverages': ethicalAverages,
    };
  }
}
