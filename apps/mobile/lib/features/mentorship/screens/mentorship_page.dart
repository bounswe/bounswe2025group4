import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user_type.dart'; // Import UserType
import '../../../core/providers/auth_provider.dart';
import './mentee_mentorship_screen.dart';

class MentorshipPage extends StatelessWidget {
  const MentorshipPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUser = authProvider.currentUser; // Get the current user

    Widget bodyContent;
    String appBarTitle = 'Mentorship';

    if (currentUser == null) {
      // User not logged in
      bodyContent = const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'Please log in to access mentorship features.',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      );
    } else if (currentUser.role == UserType.MENTOR) {
      // User is a Mentor
      // TODO: Implement Mentor screen
      bodyContent = const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'Mentor View - Coming Soon!',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      );
    } else {
      // User is Job Seeker or Employer (potential Mentee)
      // Return the MenteeMentorshipScreen directly
      return const MenteeMentorshipScreen();
    }

    // Only build Scaffold/AppBar if not returning MenteeMentorshipScreen
    return Scaffold(
      appBar: AppBar(
        title: Text(appBarTitle),
        automaticallyImplyLeading: false,
      ),
      body: bodyContent,
    );
  }
}
