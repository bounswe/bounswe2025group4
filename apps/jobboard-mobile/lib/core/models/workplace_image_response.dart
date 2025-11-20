/// Model for workplace image upload response
class WorkplaceImageResponse {
  final String imageUrl;
  final DateTime updatedAt;

  WorkplaceImageResponse({required this.imageUrl, required this.updatedAt});

  factory WorkplaceImageResponse.fromJson(Map<String, dynamic> json) {
    return WorkplaceImageResponse(
      imageUrl: json['imageUrl'] as String,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {'imageUrl': imageUrl, 'updatedAt': updatedAt.toIso8601String()};
  }
}
