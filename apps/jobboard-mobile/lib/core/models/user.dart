import './user_type.dart'; // Import the correct enum
import './mentorship_status.dart';

class User {
  final String id;
  final String username;
  final String email;
  final UserType role; // Use UserType
  final String? firstName;
  final String? lastName;
  final String? jobTitle;
  final String? company; // Same as companyName but renamed for consistency
  final String? bio; // Added bio based on DTO
  final String? employerId; // Added: Specific ID for employer operations
  final MentorshipStatus? mentorshipStatus;
  final int? maxMenteeCount;
  final List<String>? expertise;

  // Add other fields later: profilePicUrl, education, skills, etc.

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role, // Make role required
    this.firstName,
    this.lastName,
    this.jobTitle,
    this.company,
    this.bio,
    this.employerId, // Add to constructor
    this.mentorshipStatus,
    this.maxMenteeCount,
    this.expertise,
  });

  // Computed property to get full name
  String get name =>
      (firstName != null && lastName != null)
          ? '$firstName $lastName'
          : username;

  // Factory constructor for parsing user details from API (e.g., GET /api/users/{id})
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id:
          json['id']?.toString() ??
          (throw Exception('Missing user ID from JSON')),
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      role: UserType.values.byName(
        json['role'] ?? json['userType'] ?? UserType.ROLE_JOBSEEKER.name,
      ),
      firstName: json['firstName'],
      lastName: json['lastName'],
      jobTitle: json['jobTitle'],
      company: json['company'] ?? json['companyName'],
      bio: json['bio'],
      employerId: json['employerId']?.toString(),
      mentorshipStatus:
          json['mentorshipStatus'] != null
              ? MentorshipStatus.values.byName(json['mentorshipStatus'])
              : null,
      maxMenteeCount: json['maxMenteeCount'],
      expertise: List<String>.from(json['expertise'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'userType': role.name,
      'firstName': firstName,
      'lastName': lastName,
      'jobTitle': jobTitle,
      'company': company,
      'bio': bio,
      'employerId': employerId,
      'mentorshipStatus': mentorshipStatus?.name,
      'maxMenteeCount': maxMenteeCount,
      'expertise': expertise,
    };
  }

  User copyWith({
    String? id,
    String? username,
    String? email,
    UserType? role,
    String? firstName,
    String? lastName,
    String? jobTitle,
    String? company,
    String? bio,
    String? employerId,
    MentorshipStatus? mentorshipStatus,
    int? maxMenteeCount,
    List<String>? expertise,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      jobTitle: jobTitle ?? this.jobTitle,
      company: company ?? this.company,
      bio: bio ?? this.bio,
      employerId: employerId ?? this.employerId,
      mentorshipStatus: mentorshipStatus ?? this.mentorshipStatus,
      maxMenteeCount: maxMenteeCount ?? this.maxMenteeCount,
      expertise: expertise ?? this.expertise,
    );
  }

}
