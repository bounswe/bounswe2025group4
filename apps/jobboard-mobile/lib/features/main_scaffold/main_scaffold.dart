import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../generated/l10n/app_localizations.dart';
import '../forum/screens/forum_page.dart';
import '../job/screens/job_page.dart';
import '../mentorship/screens/mentorship_page.dart';
import '../profile/screens/profile_page.dart';
import '../workplaces/screens/workplaces_page.dart';
import '../../core/providers/quote_provider.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> with TickerProviderStateMixin {
  int _selectedIndex = 1;
  late List<AnimationController> _animationControllers;
  late List<Animation<double>> _scaleAnimations;

  static const List<Widget> _widgetOptions = <Widget>[
    ForumPage(),
    JobPage(),
    MentorshipPage(),
    ProfilePage(),
    WorkplacesPage(),
  ];

  void _onItemTapped(int index) {
    HapticFeedback.selectionClick();
    
    // Trigger animation for the tapped icon
    _animationControllers[index].forward().then((_) {
      _animationControllers[index].reverse();
    });
    
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    
    // Initialize animation controllers for each nav item
    _animationControllers = List.generate(
      5,
      (index) => AnimationController(
        duration: const Duration(milliseconds: 200),
        vsync: this,
      ),
    );
    
    // Initialize scale animations
    _scaleAnimations = _animationControllers.map((controller) {
      return Tween<double>(begin: 1.0, end: 1.3).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeInOut),
      );
    }).toList();
    
    // Fetch a random quote when the main scaffold loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<QuoteProvider>(context, listen: false).fetchRandomQuote();
    });
  }

  @override
  void dispose() {
    for (var controller in _animationControllers) {
      controller.dispose();
    }
    super.dispose();
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
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: ScaleTransition(
              scale: _scaleAnimations[0],
              child: const Icon(Icons.forum),
            ),
            label: AppLocalizations.of(context)!.mainScaffold_forum,
          ),
          BottomNavigationBarItem(
            icon: ScaleTransition(
              scale: _scaleAnimations[1],
              child: const Icon(Icons.work),
            ),
            label: AppLocalizations.of(context)!.mainScaffold_jobs,
          ),
          BottomNavigationBarItem(
            icon: ScaleTransition(
              scale: _scaleAnimations[2],
              child: const Icon(Icons.school),
            ),
            label: AppLocalizations.of(context)!.mainScaffold_mentorship,
          ),
          BottomNavigationBarItem(
            icon: ScaleTransition(
              scale: _scaleAnimations[3],
              child: const Icon(Icons.person),
            ),
            label: AppLocalizations.of(context)!.mainScaffold_profile,
          ),
          BottomNavigationBarItem(
            icon: ScaleTransition(
              scale: _scaleAnimations[4],
              child: const Icon(Icons.business),
            ),
            label: AppLocalizations.of(context)!.mainScaffold_workplaces,
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue, // Use blue to match onboarding design
        unselectedItemColor: Colors.grey, // Ensure unselected items are visible
        showUnselectedLabels: true, // Make labels always visible
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed, // Use fixed if > 3 items often
      ),
    );
  }
}
