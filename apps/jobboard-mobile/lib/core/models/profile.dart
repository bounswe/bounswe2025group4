// lib/core/models/profile.dart
class Profile {
  final int id;
  final int userId;
  final String fullName;
  final String? phone;
  final String? location;
  final String? occupation;
  final String? bio;
  final String? profilePicture;
  final List<String> skills;
  final List<String> interests;

  Profile({
    required this.id,
    required this.userId,
    required this.fullName,
    this.phone,
    this.location,
    this.occupation,
    this.bio,
    this.profilePicture,
    this.skills = const [],
    this.interests = const [],
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    final firstName = json['firstName'] ?? '';
    final lastName = json['lastName'] ?? '';
    final fullName = '$firstName $lastName'.trim();
    
    final skills = (json['skills'] as List<dynamic>?)
        ?.map((skill) => skill['name'] as String)
        .toList() ?? [];
    
    final interests = (json['interests'] as List<dynamic>?)
        ?.map((interest) => interest['name'] as String)
        .toList() ?? [];
    
    return Profile(
      id: json['id'],
      userId: json['userId'],
      fullName: fullName,
      phone: json['phone'],
      location: json['location'],
      occupation: json['occupation'],
      bio: json['bio'] ?? '',
      profilePicture: json['imageUrl'], // Backend'de imageUrl olarak geliyor
      skills: skills,
      interests: interests,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'fullName': fullName,
      'phone': phone,
      'location': location,
      'occupation': occupation,
      'bio': bio,
      'profilePicture': profilePicture,
      'skills': skills,
      'interests': interests,
    };
  }

  Profile copyWith({
    int? id,
    int? userId,
    String? fullName,
    String? phone,
    String? location,
    String? occupation,
    String? bio,
    String? profilePicture,
    List<String>? skills,
    List<String>? interests,
  }) {
    return Profile(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      location: location ?? this.location,
      occupation: occupation ?? this.occupation,
      bio: bio ?? this.bio,
      profilePicture: profilePicture ?? this.profilePicture,
      skills: skills ?? this.skills,
      interests: interests ?? this.interests,
    );
  }
}