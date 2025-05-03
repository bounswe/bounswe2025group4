import './user_type.dart'; // Import the correct enum

class User {
  final String id;
  final String username;
  final String email;
  final UserType role; // Use UserType
  final String? companyName; // Optional: Only relevant for Employer role
  final String? bio; // Added bio based on DTO
  final String? employerId; // Added: Specific ID for employer operations
  // Add other fields later: profilePicUrl, education, skills, etc.

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role, // Make role required
    this.companyName,
    this.bio,
    this.employerId, // Add to constructor
  });

  // Factory constructor for parsing user details from API (e.g., GET /api/users/{id})
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id:
          json['id']?.toString() ??
          (throw Exception('Missing user ID from JSON')),
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      role: UserType.values.byName(json['role'] ?? UserType.JOB_SEEKER.name),
      companyName: json['companyName'],
      bio: json['bio'],
      // Assuming employerId is directly available in the user details response for employers
      employerId: json['employerId']?.toString(),
    );
  }
}
