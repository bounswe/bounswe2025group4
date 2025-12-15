import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/notifications/screens/notifications_screen.dart';
import 'package:mobile/core/providers/notification_provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/providers/tab_navigation_provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/services/notification_websocket_service.dart';
import 'package:mobile/core/models/notification.dart' as models;
import 'package:provider/provider.dart';

// Mock AuthProvider for ApiService
class MockAuthProviderForTest extends AuthProvider {
  @override
  bool get isLoggedIn => true;

  @override
  String? get token => 'test-token';
}

class MockNotificationProvider extends NotificationProvider {
  final List<models.Notification> _notifications = [];
  bool _isLoading = false;
  String? _error;

  MockNotificationProvider()
      : super(
          apiService: ApiService(authProvider: MockAuthProviderForTest()),
          webSocketService: NotificationWebSocketService(),
        );

  void setNotifications(List<models.Notification> notifications) {
    _notifications.clear();
    _notifications.addAll(notifications);
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String? error) {
    _error = error;
    notifyListeners();
  }

  @override
  List<models.Notification> get notifications => _notifications;

  @override
  bool get isLoading => _isLoading;

  @override
  String? get error => _error;

  @override
  int get unreadCount => _notifications.where((n) => !n.read).length;
}

class MockAuthProvider extends AuthProvider {
  @override
  bool get isLoggedIn => true;

  @override
  String? get token => 'test-token';
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NotificationsScreen Widget Tests', () {
    late MockNotificationProvider mockNotificationProvider;
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockNotificationProvider = MockNotificationProvider();
      mockAuthProvider = MockAuthProvider();
    });

    tearDown(() {
      mockNotificationProvider.dispose();
    });

    Widget createTestWidget() {
      return MaterialApp(
        home: MultiProvider(
          providers: [
            ChangeNotifierProvider<NotificationProvider>.value(
              value: mockNotificationProvider,
            ),
            ChangeNotifierProvider<AuthProvider>.value(
              value: mockAuthProvider,
            ),
            ChangeNotifierProvider<TabNavigationProvider>(
              create: (_) => TabNavigationProvider(),
            ),
          ],
          child: const NotificationsScreen(),
        ),
      );
    }

    testWidgets('should display loading indicator when loading', (
      WidgetTester tester,
    ) async {
      // Arrange
      mockNotificationProvider.setLoading(true);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should display error message when error occurs', (
      WidgetTester tester,
    ) async {
      // Arrange
      mockNotificationProvider.setError('Failed to load notifications');
      mockNotificationProvider.setLoading(false);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert
      expect(find.text('Error loading notifications'), findsOneWidget);
      expect(find.text('Failed to load notifications'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });

    testWidgets('should display empty state when no notifications', (
      WidgetTester tester,
    ) async {
      // Arrange
      mockNotificationProvider.setNotifications([]);
      mockNotificationProvider.setLoading(false);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert
      expect(find.text('No notifications yet'), findsOneWidget);
      expect(
        find.text(
          'You\'ll see notifications here when you have new activity',
        ),
        findsOneWidget,
      );
    });

    testWidgets('should display list of notifications', (WidgetTester tester) async {
      // Arrange
      final notifications = [
        models.Notification(
          id: 1,
          title: 'Notification 1',
          notificationType: 'GENERAL',
          message: 'Message 1',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
        models.Notification(
          id: 2,
          title: 'Notification 2',
          notificationType: 'GENERAL',
          message: 'Message 2',
          timestamp: DateTime.now().millisecondsSinceEpoch - 1000,
          read: true,
        ),
      ];
      mockNotificationProvider.setNotifications(notifications);
      mockNotificationProvider.setLoading(false);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert
      expect(find.text('Notification 1'), findsOneWidget);
      expect(find.text('Notification 2'), findsOneWidget);
      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('should show mark all as read button when unread notifications exist', (
      WidgetTester tester,
    ) async {
      // Arrange
      final notifications = [
        models.Notification(
          id: 1,
          title: 'Unread Notification',
          notificationType: 'GENERAL',
          message: 'Test',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
      ];
      mockNotificationProvider.setNotifications(notifications);
      mockNotificationProvider.setLoading(false);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert
      expect(find.text('Mark all as read'), findsOneWidget);
    });

    testWidgets('should show refresh button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byIcon(Icons.refresh), findsOneWidget);
    });

    testWidgets('should support pull to refresh', (WidgetTester tester) async {
      // Arrange
      final notifications = [
        models.Notification(
          id: 1,
          title: 'Notification',
          notificationType: 'GENERAL',
          message: 'Test',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
      ];
      mockNotificationProvider.setNotifications(notifications);
      mockNotificationProvider.setLoading(false);

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Act - Pull to refresh
      final listView = find.byType(ListView);
      await tester.drag(listView, const Offset(0, 300));
      await tester.pumpAndSettle();

      // Assert - Should trigger refresh (no error thrown)
      expect(find.byType(ListView), findsOneWidget);
    });
  });
}

