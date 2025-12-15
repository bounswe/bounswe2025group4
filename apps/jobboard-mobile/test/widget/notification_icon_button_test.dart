import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/widgets/notification_icon_button.dart';
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

  @override
  List<models.Notification> get notifications => _notifications;

  @override
  int get unreadCount => _notifications.where((n) => !n.read).length;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NotificationIconButton Widget Tests', () {
    late MockNotificationProvider mockProvider;

    setUp(() {
      mockProvider = MockNotificationProvider();
    });

    tearDown(() {
      mockProvider.dispose();
    });

    Widget createTestWidget() {
      return MaterialApp(
        home: MultiProvider(
          providers: [
            ChangeNotifierProvider<NotificationProvider>.value(
              value: mockProvider,
            ),
            ChangeNotifierProvider<AuthProvider>(
              create: (_) => MockAuthProviderForTest(),
            ),
            ChangeNotifierProvider<TabNavigationProvider>(
              create: (_) => TabNavigationProvider(),
            ),
          ],
          child: Scaffold(
            appBar: AppBar(
              actions: const [
                NotificationIconButton(),
              ],
            ),
            body: const Center(child: Text('Test')),
          ),
        ),
      );
    }

    testWidgets('should display notification icon', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.notifications), findsOneWidget);
    });

    testWidgets('should not show badge when no unread notifications', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Should not find badge (red container)
      expect(find.byType(Container), findsNothing);
    });

    testWidgets('should show badge with unread count', (WidgetTester tester) async {
      // Arrange
      final notifications = [
        models.Notification(
          id: 1,
          title: 'Unread Notification',
          notificationType: 'GENERAL',
          message: 'Test message',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
      ];
      mockProvider.setNotifications(notifications);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert - Should find badge with count "1"
      expect(find.text('1'), findsOneWidget);
    });

    testWidgets('should show 99+ for more than 99 unread notifications', (
      WidgetTester tester,
    ) async {
      // Arrange
      final notifications = List.generate(
        100,
        (index) => models.Notification(
          id: index,
          title: 'Notification $index',
          notificationType: 'GENERAL',
          message: 'Message $index',
          timestamp: DateTime.now().millisecondsSinceEpoch - index,
          read: false,
        ),
      );
      mockProvider.setNotifications(notifications);

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Assert - Should find "99+" text
      expect(find.text('99+'), findsOneWidget);
    });

    testWidgets('should be tappable and have navigation callback', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Find the icon button by type (not by icon, as that finds the Icon widget inside)
      final iconButtonFinder = find.byType(IconButton);
      expect(iconButtonFinder, findsOneWidget);

      // Verify it's tappable (has onPressed callback)
      final buttonWidget = tester.widget<IconButton>(iconButtonFinder);
      expect(buttonWidget.onPressed, isNotNull);

      // Note: We don't test actual navigation here because it requires
      // complex provider setup for NotificationsScreen. The important part
      // is that the button is functional and has a navigation callback.
      // Full navigation testing should be done in integration tests.
    });

    testWidgets('should update badge when unread count changes', (
      WidgetTester tester,
    ) async {
      // Arrange - Start with no notifications
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('1'), findsNothing);

      // Act - Add unread notification
      final notifications = [
        models.Notification(
          id: 1,
          title: 'New Notification',
          notificationType: 'GENERAL',
          message: 'Test',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
      ];
      mockProvider.setNotifications(notifications);
      await tester.pump();

      // Assert - Badge should appear
      expect(find.text('1'), findsOneWidget);
    });
  });
}

