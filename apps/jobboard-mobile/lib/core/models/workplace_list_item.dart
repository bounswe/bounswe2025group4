/// Model for workplace list item (simplified version for list view)
class WorkplaceListItem {
  final int id;
  final String companyName;
  final String? imageUrl;
  final String sector;
  final String location;
  final String shortDescription;
  final double? overallAvg;
  final List<String> ethicalTags;
  final Map<String, double> ethicalAverages;

  WorkplaceListItem({
    required this.id,
    required this.companyName,
    this.imageUrl,
    required this.sector,
    required this.location,
    required this.shortDescription,
    required this.overallAvg,
    required this.ethicalTags,
    required this.ethicalAverages,
  });

  factory WorkplaceListItem.fromJson(Map<String, dynamic> json) {
    return WorkplaceListItem(
      id: json['id'] as int,
      companyName: json['companyName'] as String,
      imageUrl: json['imageUrl'] as String?,
      sector: json['sector'] as String,
      location: json['location'] as String,
      shortDescription: json['shortDescription'] as String,
      overallAvg: (json['overallAvg'] as num?)?.toDouble(),
      ethicalTags: List<String>.from(json['ethicalTags'] as List? ?? []),
      ethicalAverages:
          json['ethicalAverages'] != null
              ? Map<String, double>.from(
                (json['ethicalAverages'] as Map<String, dynamic>).map(
                  (key, value) =>
                      MapEntry(key, (value as num?)?.toDouble() ?? 0.0),
                ),
              )
              : {},
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
    };
  }
}
