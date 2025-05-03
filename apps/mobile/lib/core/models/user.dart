import './user_type.dart'; // Import the correct enum

class User {
  final String id;
  final String username;
  final String email;
  final UserType role; // Use UserType
  final String? companyName; // Optional: Only relevant for Employer role
  final String? bio; // Added bio based on DTO
  // Add other fields later: profilePicUrl, education, skills, etc.

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role, // Make role required
    this.companyName,
    this.bio,
  });

  // Add factory constructors for JSON parsing later
}
