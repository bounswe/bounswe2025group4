import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../forum/screens/forum_page.dart'; // Adjust path
import '../job/screens/job_page.dart'; // Adjust path
import '../mentorship/screens/mentorship_page.dart'; // Adjust path
import '../profile/screens/profile_page.dart'; // Adjust path
import '../workplaces/screens/workplaces_page.dart'; // Adjust path
import '../../core/providers/auth_provider.dart'; // Adjust path

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 1; // Default to Job page (index 1)

  // List of widgets to display based on the selected index
  static const List<Widget> _widgetOptions = <Widget>[
    ForumPage(),
    JobPage(), // Your focus area
    MentorshipPage(), // Your focus area
    ProfilePage(),
    WorkplacesPage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    // You might need access to the user's role here or within specific pages
    // final userRole = Provider.of<AuthProvider>(context).currentUser?.role;
    // print("Building MainScaffold. Current user role: $userRole"); // Debug print

    return Scaffold(
      // AppBar can be added here if common to all pages,
      // or within each individual page if they differ.
      // appBar: AppBar(title: Text('Job Platform')),
      body: Center(
        // Display the widget corresponding to the selected index
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.forum), label: 'Forum'),
          BottomNavigationBarItem(
            icon: Icon(Icons.work),
            label: 'Jobs', // This is your Job page
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school), // Or Icons.people or similar
            label: 'Mentorship', // This is your Mentorship page
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Workplaces',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.amber[800], // Customize color
        unselectedItemColor: Colors.grey, // Ensure unselected items are visible
        showUnselectedLabels: true, // Make labels always visible
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed, // Use fixed if > 3 items often
      ),
    );
  }
}
