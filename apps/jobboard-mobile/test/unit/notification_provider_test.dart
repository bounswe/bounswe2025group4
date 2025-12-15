import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/notification_provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/services/notification_websocket_service.dart';
import 'package:mobile/core/models/notification.dart' as models;
import 'package:mobile/core/models/notification_message.dart';
import 'dart:async';

// Mock AuthProvider for ApiService
class MockAuthProviderForTest extends AuthProvider {
  @override
  bool get isLoggedIn => true;

  @override
  String? get token => 'test-token';
}

// Mock ApiService
class MockApiService extends ApiService {
  final List<models.Notification> _notifications = [];
  bool _shouldThrowError = false;

  MockApiService() : super(authProvider: MockAuthProviderForTest());

  void setNotifications(List<models.Notification> notifications) {
    _notifications.clear();
    _notifications.addAll(notifications);
  }

  void setShouldThrowError(bool value) {
    _shouldThrowError = value;
  }

  @override
  Future<List<models.Notification>> getMyNotifications() async {
    if (_shouldThrowError) {
      throw Exception('Failed to fetch notifications');
    }
    await Future.delayed(const Duration(milliseconds: 100));
    return List.from(_notifications);
  }

  @override
  Future<void> markNotificationAsRead(int notificationId) async {
    await Future.delayed(const Duration(milliseconds: 50));
  }
}

// Mock NotificationWebSocketService
class MockNotificationWebSocketService extends NotificationWebSocketService {
  final _notificationController = StreamController<NotificationMessage>.broadcast();
  final _connectionStatusController = StreamController<bool>.broadcast();
  bool _isConnected = false;

  @override
  Stream<NotificationMessage> get notificationStream => _notificationController.stream;

  @override
  Stream<bool> get connectionStatusStream => _connectionStatusController.stream;

  @override
  bool get isConnected => _isConnected;

  void simulateNotification(NotificationMessage message) {
    _notificationController.add(message);
  }

  void simulateConnection(bool connected) {
    _isConnected = connected;
    _connectionStatusController.add(connected);
  }

  @override
  Future<void> connect(String token, String username) async {
    await Future.delayed(const Duration(milliseconds: 50));
    _isConnected = true;
    _connectionStatusController.add(true);
  }

  @override
  void disconnect() {
    _isConnected = false;
    _connectionStatusController.add(false);
  }

  @override
  void dispose() {
    _notificationController.close();
    _connectionStatusController.close();
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NotificationProvider Tests', () {
    late MockApiService mockApiService;
    late MockNotificationWebSocketService mockWebSocketService;
    late NotificationProvider notificationProvider;

    setUp(() {
      mockApiService = MockApiService();
      mockWebSocketService = MockNotificationWebSocketService();
      notificationProvider = NotificationProvider(
        apiService: mockApiService,
        webSocketService: mockWebSocketService,
      );
    });

    tearDown(() {
      notificationProvider.dispose();
      mockWebSocketService.dispose();
    });

    test('should start with empty notifications', () {
      expect(notificationProvider.notifications, isEmpty);
      expect(notificationProvider.unreadCount, 0);
      expect(notificationProvider.isLoading, false);
    });

    test('should fetch notifications from API', () async {
      // Arrange
      final testNotifications = [
        models.Notification(
          id: 1,
          title: 'Test Notification 1',
          notificationType: 'GENERAL',
          message: 'Test message 1',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
        models.Notification(
          id: 2,
          title: 'Test Notification 2',
          notificationType: 'GENERAL',
          message: 'Test message 2',
          timestamp: DateTime.now().millisecondsSinceEpoch - 1000,
          read: true,
        ),
      ];
      mockApiService.setNotifications(testNotifications);

      // Act
      await notificationProvider.fetchNotifications();

      // Assert
      expect(notificationProvider.notifications.length, 2);
      expect(notificationProvider.unreadCount, 1);
      expect(notificationProvider.isLoading, false);
    });

    test('should calculate unread count correctly', () async {
      // Arrange
      final testNotifications = [
        models.Notification(
          id: 1,
          title: 'Unread 1',
          notificationType: 'GENERAL',
          message: 'Message 1',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
        models.Notification(
          id: 2,
          title: 'Read 1',
          notificationType: 'GENERAL',
          message: 'Message 2',
          timestamp: DateTime.now().millisecondsSinceEpoch - 1000,
          read: true,
        ),
        models.Notification(
          id: 3,
          title: 'Unread 2',
          notificationType: 'GENERAL',
          message: 'Message 3',
          timestamp: DateTime.now().millisecondsSinceEpoch - 2000,
          read: false,
        ),
      ];
      mockApiService.setNotifications(testNotifications);

      // Act
      await notificationProvider.fetchNotifications();

      // Assert
      expect(notificationProvider.unreadCount, 2);
    });

    test('should add notification from WebSocket stream', () async {
      // Arrange
      final notificationMessage = NotificationMessage(
        title: 'New Message',
        notificationType: 'NEW_MESSAGE',
        message: 'You have a new message',
        timestamp: DateTime.now().millisecondsSinceEpoch,
      );

      // Act
      mockWebSocketService.simulateNotification(notificationMessage);
      await Future.delayed(const Duration(milliseconds: 200));

      // Assert
      expect(notificationProvider.notifications.length, 1);
      expect(notificationProvider.notifications.first.title, 'New Message');
      expect(notificationProvider.unreadCount, 1);
      
      // Wait for background fetch to complete before dispose
      await Future.delayed(const Duration(milliseconds: 600));
    });

    test('should mark notification as read', () async {
      // Arrange
      final testNotifications = [
        models.Notification(
          id: 1,
          title: 'Test Notification',
          notificationType: 'GENERAL',
          message: 'Test message',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
      ];
      mockApiService.setNotifications(testNotifications);
      await notificationProvider.fetchNotifications();

      // Act
      await notificationProvider.markAsRead(1);

      // Assert
      expect(notificationProvider.notifications.first.read, true);
      expect(notificationProvider.unreadCount, 0);
    });

    test('should mark all notifications as read', () async {
      // Arrange
      final testNotifications = [
        models.Notification(
          id: 1,
          title: 'Unread 1',
          notificationType: 'GENERAL',
          message: 'Message 1',
          timestamp: DateTime.now().millisecondsSinceEpoch,
          read: false,
        ),
        models.Notification(
          id: 2,
          title: 'Unread 2',
          notificationType: 'GENERAL',
          message: 'Message 2',
          timestamp: DateTime.now().millisecondsSinceEpoch - 1000,
          read: false,
        ),
      ];
      mockApiService.setNotifications(testNotifications);
      await notificationProvider.fetchNotifications();
      expect(notificationProvider.unreadCount, 2);

      // Act
      await notificationProvider.markAllAsRead();

      // Assert
      expect(notificationProvider.unreadCount, 0);
      expect(notificationProvider.notifications.every((n) => n.read), true);
    });

    test('should handle WebSocket connection status changes', () async {
      // Act
      mockWebSocketService.simulateConnection(true);
      await Future.delayed(const Duration(milliseconds: 100));

      // Assert
      expect(notificationProvider.isWebSocketConnected, true);

      // Act
      mockWebSocketService.simulateConnection(false);
      await Future.delayed(const Duration(milliseconds: 100));

      // Assert
      expect(notificationProvider.isWebSocketConnected, false);
    });

    test('should handle fetch error gracefully', () async {
      // Arrange
      mockApiService.setShouldThrowError(true);

      // Act
      await notificationProvider.fetchNotifications();

      // Assert
      expect(notificationProvider.error, isNotNull);
      expect(notificationProvider.isLoading, false);
      expect(notificationProvider.notifications, isEmpty);
    });

    test('should merge temporary notifications with server notifications', () async {
      // Arrange - Add temporary notification from WebSocket
      final wsNotification = NotificationMessage(
        title: 'WebSocket Notification',
        notificationType: 'GENERAL',
        message: 'From WebSocket',
        timestamp: DateTime.now().millisecondsSinceEpoch,
      );
      mockWebSocketService.simulateNotification(wsNotification);
      await Future.delayed(const Duration(milliseconds: 100));

      // Server notification with same timestamp (should replace temporary)
      final serverNotifications = [
        models.Notification(
          id: 1,
          title: 'WebSocket Notification',
          notificationType: 'GENERAL',
          message: 'From WebSocket',
          timestamp: wsNotification.timestamp,
          read: false,
        ),
      ];
      mockApiService.setNotifications(serverNotifications);

      // Act
      await notificationProvider.fetchNotifications(showLoading: false);
      await Future.delayed(const Duration(milliseconds: 200));

      // Assert - Should have one notification (temporary replaced by server)
      expect(notificationProvider.notifications.length, 1);
      expect(notificationProvider.notifications.first.id, 1); // Server notification ID
    });

    test('should connect to WebSocket', () async {
      // Act
      await notificationProvider.connectWebSocket('test-token', 'testuser');

      // Assert
      expect(notificationProvider.isWebSocketConnected, true);
    });

    test('should disconnect from WebSocket', () {
      // Arrange
      mockWebSocketService.simulateConnection(true);

      // Act
      notificationProvider.disconnectWebSocket();

      // Assert
      expect(notificationProvider.isWebSocketConnected, false);
      expect(notificationProvider.notifications, isEmpty);
    });
  });
}

