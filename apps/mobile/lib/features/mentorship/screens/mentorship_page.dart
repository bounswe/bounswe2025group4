import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/mentorship_status.dart';
import '../providers/mentor_provider.dart';
import './mentee_mentorship_screen.dart';
import './mentor_mentorship_screen.dart';

class MentorshipPage extends StatelessWidget {
  const MentorshipPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final apiService = Provider.of<ApiService>(context);

    // If the user is not logged in, show a message
    if (!authProvider.isLoggedIn) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mentorship')),
        body: const Center(
          child: Text(
            'Please log in to access mentorship features.',
            style: TextStyle(fontSize: 16),
          ),
        ),
      );
    }

    // Determine which screen to show
    final isMentor =
        authProvider.currentUser?.mentorshipStatus == MentorshipStatus.MENTOR;

    // Create a MentorProvider for this screen
    return ChangeNotifierProvider(
      create: (_) => MentorProvider(apiService: apiService),
      // Use Builder to access the provider in a separate build method
      child: Builder(
        builder: (context) {
          return isMentor
              ? const MentorMentorshipScreen()
              : const MenteeMentorshipScreen();
        },
      ),
    );
  }
}
