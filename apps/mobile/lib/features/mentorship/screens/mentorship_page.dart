import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user.dart'; // Adjust path
import '../../../core/providers/auth_provider.dart'; // Adjust path

class MentorshipPage extends StatelessWidget {
  const MentorshipPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Get the current user's role
    final userRole = Provider.of<AuthProvider>(context).currentUser?.role;

    print("Building MentorshipPage. Role: $userRole"); // Debug print

    Widget content;

    // Display different views based on whether the user IS a mentor or NOT
    if (userRole == UserRole.mentor) {
      content = _buildMentorView(context);
    } else {
      // Assume Job Seekers and potentially others can request mentorship
      content = _buildMenteeView(context);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          userRole == UserRole.mentor ? 'My Mentees' : 'Find a Mentor',
        ),
      ),
      body: content,
    );
  }

  // --- Builder Methods for Different Roles ---

  Widget _buildMentorView(BuildContext context) {
    // TODO: Implement Mentor View (Req 1.1.5.1 - 1.1.5.6)
    // - Display own profile info (rating, comments, review count)
    // - Set availability/capacity (Req 1.1.5.2)
    // - View incoming mentorship requests (Req 1.1.5.3)
    // - Accept/Decline requests (Req 1.1.5.4)
    // - Access direct messaging channels for accepted requests (Req 1.1.5.5, 1.1.5.6)
    return const Center(
      child: Text('Mentor View: Manage requests, availability, and chats.'),
    );
  }

  Widget _buildMenteeView(BuildContext context) {
    // TODO: Implement Mentee (Job Seeker) View (Req 1.1.5.7 - 1.1.5.9)
    // - Display list of available mentors (Mentorship Screen)
    // - Show mentor details (rating, comments, review count, capacity - Req 1.1.5.1, 1.1.5.7)
    // - Send mentorship request to a selected mentor (Req 1.1.5.8)
    // - View status of own requests
    // - Access direct messaging channels for accepted requests
    // - Rate/comment on mentors after service (Req 1.1.5.9)
    return const Center(
      child: Text('Mentee View: Find mentors, send requests, rate service.'),
    );
  }
}
