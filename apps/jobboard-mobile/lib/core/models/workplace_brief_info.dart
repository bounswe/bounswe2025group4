/// Brief workplace information included in job responses
class WorkplaceBriefInfo {
  final int id;
  final String companyName;
  final String sector;
  final String location;
  final String? imageUrl;
  final List<String> ethicalTags;

  WorkplaceBriefInfo({
    required this.id,
    required this.companyName,
    required this.sector,
    required this.location,
    this.imageUrl,
    required this.ethicalTags,
  });

  factory WorkplaceBriefInfo.fromJson(Map<String, dynamic> json) {
    return WorkplaceBriefInfo(
      id: json['id'] as int,
      companyName: json['companyName'] as String,
      sector: json['sector'] as String,
      location: json['location'] as String,
      imageUrl: json['imageUrl'] as String?,
      ethicalTags: json['ethicalTags'] != null
          ? List<String>.from(json['ethicalTags'] as List)
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'companyName': companyName,
      'sector': sector,
      'location': location,
      if (imageUrl != null) 'imageUrl': imageUrl,
      'ethicalTags': ethicalTags,
    };
  }
}

