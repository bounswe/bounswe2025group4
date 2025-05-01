import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart'; // Adjust path
import '../../auth/screens/sign_in_screen.dart'; // Adjust path

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await authProvider.logout();
              // Navigate back to sign in screen and remove all previous routes
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const SignInScreen()),
                (Route<dynamic> route) => false, // Remove all routes
              );
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Profile Page - User: ${authProvider.currentUser?.username ?? 'N/A'}',
            ),
            const SizedBox(height: 10),
            Text(
              'Role: ${authProvider.currentUser?.role.toString().split('.').last ?? 'N/A'}',
            ),
            const SizedBox(height: 20),
            const Text('More profile details and editing TBD'),
            // TODO: Add profile editing, badges, etc. (Req 1.1.2)
          ],
        ),
      ),
    );
  }
}
