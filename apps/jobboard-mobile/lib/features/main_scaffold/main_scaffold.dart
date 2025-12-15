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
import '../../core/providers/auth_provider.dart';
import '../../core/providers/notification_provider.dart';
import '../../core/providers/tab_navigation_provider.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> with TickerProviderStateMixin {
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
    
    // Update tab via provider
    Provider.of<TabNavigationProvider>(context, listen: false).changeTab(index);
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
      
      // Connect to notification WebSocket
      _connectNotificationWebSocket();
      
      // Listen to auth changes to reconnect WebSocket when user logs in/out
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      authProvider.addListener(_onAuthStateChanged);
    });
  }
  
  /// Handle authentication state changes
  void _onAuthStateChanged() {
    if (!mounted) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    
    if (authProvider.isLoggedIn &&
        authProvider.token != null &&
        authProvider.currentUser?.username != null) {
      // User logged in - connect WebSocket
      if (!notificationProvider.isWebSocketConnected) {
        print('[MainScaffold] User logged in, connecting notification WebSocket...');
        notificationProvider.connectWebSocket(
          authProvider.token!,
          authProvider.currentUser!.username,
        );
        
        // Fetch notifications after connection
        Future.delayed(const Duration(milliseconds: 1000), () {
          if (mounted) {
            print('[MainScaffold] Fetching notifications after login...');
            notificationProvider.fetchNotifications();
          }
        });
      }
    } else {
      // User logged out - disconnect WebSocket
      if (notificationProvider.isWebSocketConnected) {
        print('[MainScaffold] User logged out, disconnecting notification WebSocket...');
        notificationProvider.disconnectWebSocket();
      }
    }
  }
  
  /// Connect to notification WebSocket if user is logged in
  void _connectNotificationWebSocket() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    
    if (authProvider.isLoggedIn &&
        authProvider.token != null &&
        authProvider.currentUser?.username != null) {
      print('[MainScaffold] Connecting notification WebSocket...');
      notificationProvider.connectWebSocket(
        authProvider.token!,
        authProvider.currentUser!.username,
      );
      
      // Fetch notifications immediately if WebSocket is already connected
      // This handles the case when user logs in while WebSocket is already active
      Future.delayed(const Duration(milliseconds: 1000), () {
        if (mounted) {
          print('[MainScaffold] Fetching notifications after connection...');
          notificationProvider.fetchNotifications();
        }
      });
    }
  }

  @override
  void dispose() {
    // Remove auth listener
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    authProvider.removeListener(_onAuthStateChanged);
    
    for (var controller in _animationControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TabNavigationProvider>(
      builder: (context, tabProvider, child) {
        return Scaffold(
          body: Center(
            // Display the widget corresponding to the selected index
            child: _widgetOptions.elementAt(tabProvider.selectedIndex),
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
            currentIndex: tabProvider.selectedIndex,
            selectedItemColor: Colors.blue, // Use blue to match onboarding design
            unselectedItemColor: Colors.grey, // Ensure unselected items are visible
            showUnselectedLabels: true, // Make labels always visible
            onTap: _onItemTapped,
            type: BottomNavigationBarType.fixed, // Use fixed if > 3 items often
          ),
        );
      },
    );
  }
}
