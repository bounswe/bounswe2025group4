enum UserRole { guest, jobSeeker, employer, mentor }

class User {
  final String id;
  final String username;
  final String email;
  final UserRole role; // Key property to differentiate views
  // Add other fields later: profilePicUrl, bio, education, skills, etc.

  User({
    required this.id,
    required this.username,
    required this.email,
    this.role = UserRole.jobSeeker, // Default role
  });

  // Add factory constructors for JSON parsing later
}
