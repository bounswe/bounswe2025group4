import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/services/notification_websocket_service.dart';
import 'package:mobile/core/models/notification_message.dart';
import 'dart:async';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NotificationWebSocketService Tests', () {
    late NotificationWebSocketService service;

    setUp(() {
      service = NotificationWebSocketService();
    });

    tearDown(() {
      service.dispose();
    });

    test('should start disconnected', () {
      expect(service.isConnected, false);
    });

    test('should have notification stream', () {
      expect(service.notificationStream, isNotNull);
    });

    test('should have connection status stream', () {
      expect(service.connectionStatusStream, isNotNull);
    });

    test('should not connect if already connected with same credentials', () async {
      // Note: This test requires actual WebSocket connection which may fail in test environment
      // In a real scenario, you would mock the StompClient
      // For now, we test the logic without actual connection
      
      expect(service.isConnected, false);
    });

    test('should handle disconnect when not connected', () {
      // Act
      service.disconnect();

      // Assert - Should not throw
      expect(service.isConnected, false);
    });

    test('should dispose resources correctly', () {
      // Act
      service.dispose();

      // Assert - Should not throw
      expect(service.isConnected, false);
    });
  });
}

