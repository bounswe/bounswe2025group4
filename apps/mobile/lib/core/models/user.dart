enum UserRole { guest, jobSeeker, employer, mentor, mentee }

class User {
  final String id;
  final String username;
  final String email;
  final UserRole role; // Key property to differentiate views
  final String? companyName; // Optional: Only relevant for Employer role
  // Add other fields later: profilePicUrl, bio, education, skills, etc.

  User({
    required this.id,
    required this.username,
    required this.email,
    this.role = UserRole.jobSeeker, // Default role
    this.companyName, // Add to constructor
  });

  // Add factory constructors for JSON parsing later
}
