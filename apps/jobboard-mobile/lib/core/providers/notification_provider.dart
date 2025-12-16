import 'dart:async';
import 'package:flutter/material.dart';
import '../models/notification.dart' as models;
import '../models/notification_message.dart';
import '../services/api_service.dart';
import '../services/notification_websocket_service.dart';

/// Provider for managing notifications state
class NotificationProvider with ChangeNotifier {
  final ApiService _apiService;
  final NotificationWebSocketService _webSocketService;

  List<models.Notification> _notifications = [];
  bool _isLoading = false;
  String? _error;
  StreamSubscription<NotificationMessage>? _notificationSubscription;
  StreamSubscription<bool>? _connectionSubscription;
  Timer? _periodicFetchTimer;
  static const Duration _fetchInterval = Duration(seconds: 5); // Fetch every 1 second

  NotificationProvider({
    required ApiService apiService,
    required NotificationWebSocketService webSocketService,
  })  : _apiService = apiService,
        _webSocketService = webSocketService {
    _initializeWebSocketListeners();
  }

  /// List of all notifications
  List<models.Notification> get notifications => _notifications;

  /// Unread notifications count
  int get unreadCount =>
      _notifications.where((n) => !n.read).length;

  /// Check if loading
  bool get isLoading => _isLoading;

  /// Get error message
  String? get error => _error;

  /// Check if WebSocket is connected
  bool get isWebSocketConnected => _webSocketService.isConnected;

  /// Initialize WebSocket listeners
  void _initializeWebSocketListeners() {
    // Listen to incoming notifications
    _notificationSubscription = _webSocketService.notificationStream.listen(
      (notificationMessage) {
        print('[NotificationProvider] Received real-time notification: ${notificationMessage.title}');
        
        // Optimistically add notification immediately to update badge
        // Use negative ID as temporary identifier (will be replaced when fetching from server)
        final tempNotification = models.Notification(
          id: -notificationMessage.timestamp, // Temporary ID
          title: notificationMessage.title,
          notificationType: notificationMessage.notificationType,
          message: notificationMessage.message,
          timestamp: notificationMessage.timestamp,
          read: false,
          username: null,
          linkId: null,
        );
        
        // Add to beginning of list (newest first)
        _notifications.insert(0, tempNotification);
        final newUnreadCount = _notifications.where((n) => !n.read).length;
        print('[NotificationProvider] Optimistic update: unreadCount = $newUnreadCount');
        notifyListeners(); // Immediately update UI/badge
        
        // Refresh notifications from server to get the full notification with ID
        // Wait a bit for server to save the notification before fetching
        // Don't show loading indicator and don't await - let it run in background so badge updates immediately
        Future.delayed(const Duration(milliseconds: 500), () {
          fetchNotifications(showLoading: false).catchError((error) {
            print('[NotificationProvider] Error refreshing notifications after WebSocket message: $error');
          });
        });
      },
      onError: (error) {
        print('[NotificationProvider] WebSocket stream error: $error');
      },
    );

    // Listen to connection status changes
    _connectionSubscription = _webSocketService.connectionStatusStream.listen(
      (isConnected) {
        print('[NotificationProvider] WebSocket connection status: $isConnected');
        notifyListeners();
        
        // Fetch notifications when connected and start periodic fetching
        if (isConnected) {
          fetchNotifications();
          _startPeriodicFetch();
        } else {
          _stopPeriodicFetch();
        }
      },
      onError: (error) {
        print('[NotificationProvider] Connection status stream error: $error');
      },
    );
  }

  /// Fetch notifications from API
  Future<void> fetchNotifications({bool showLoading = true}) async {
    try {
      if (showLoading) {
        _isLoading = true;
        _error = null;
        notifyListeners();
      }

      print('[NotificationProvider] Fetching notifications...');
      final notifications = await _apiService.getMyNotifications();
      
      // Sort notifications by timestamp (newest first)
      notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      
      // Merge with temporary notifications (keep temporary ones that don't exist in server response)
      // Temporary notifications have negative IDs
      final tempNotifications = _notifications.where((n) => n.id < 0).toList();
      
      // Create a set of server notification timestamps for quick lookup
      // We match by timestamp since temporary notifications use -timestamp as ID
      final serverNotificationTimestamps = notifications.map((n) => n.timestamp).toSet();
      
      // Keep temporary notifications that haven't been confirmed by server yet
      // (server hasn't returned a notification with matching timestamp)
      final unconfirmedTempNotifications = tempNotifications.where(
        (temp) => !serverNotificationTimestamps.contains(temp.timestamp),
      ).toList();
      
      // Combine: server notifications first, then unconfirmed temporary ones
      _notifications = [...notifications, ...unconfirmedTempNotifications];
      
      // Sort again by timestamp (newest first)
      _notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      
      _isLoading = false;
      _error = null;
      
      print('[NotificationProvider] Fetched ${notifications.length} notifications from server');
      print('[NotificationProvider] Total notifications: ${_notifications.length} (${unconfirmedTempNotifications.length} temporary)');
      print('[NotificationProvider] Unread count: $unreadCount');
      notifyListeners();
    } catch (e) {
      print('[NotificationProvider] Error fetching notifications: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Mark notification as read
  Future<void> markAsRead(int notificationId) async {
    try {
      print('[NotificationProvider] Marking notification $notificationId as read');
      
      // Optimistically update UI
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        _notifications[index] = _notifications[index].copyWith(read: true);
        notifyListeners();
      }

      // Call API
      await _apiService.markNotificationAsRead(notificationId);
      
      print('[NotificationProvider] Notification marked as read');
    } catch (e) {
      print('[NotificationProvider] Error marking notification as read: $e');
      // Revert optimistic update on error
      fetchNotifications();
      rethrow;
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      final unreadNotifications = _notifications.where((n) => !n.read).toList();
      
      for (final notification in unreadNotifications) {
        await markAsRead(notification.id);
      }
      
      print('[NotificationProvider] All notifications marked as read');
    } catch (e) {
      print('[NotificationProvider] Error marking all as read: $e');
      rethrow;
    }
  }

  /// Connect to WebSocket
  Future<void> connectWebSocket(String token, String username) async {
    try {
      print('[NotificationProvider] Connecting WebSocket...');
      await _webSocketService.connect(token, username);
    } catch (e) {
      print('[NotificationProvider] Error connecting WebSocket: $e');
      _error = 'Failed to connect to notification service';
      notifyListeners();
    }
  }

  /// Start periodic fetching of notifications
  void _startPeriodicFetch() {
    _stopPeriodicFetch(); // Stop any existing timer
    
    print('[NotificationProvider] Starting periodic fetch (every ${_fetchInterval.inSeconds}s)');
    _periodicFetchTimer = Timer.periodic(_fetchInterval, (timer) {
      print('[NotificationProvider] Periodic fetch triggered');
      fetchNotifications(showLoading: false);
    });
  }

  /// Stop periodic fetching of notifications
  void _stopPeriodicFetch() {
    if (_periodicFetchTimer != null) {
      print('[NotificationProvider] Stopping periodic fetch');
      _periodicFetchTimer!.cancel();
      _periodicFetchTimer = null;
    }
  }

  /// Disconnect from WebSocket
  void disconnectWebSocket() {
    print('[NotificationProvider] Disconnecting WebSocket...');
    _stopPeriodicFetch();
    _webSocketService.disconnect();
    _notifications.clear();
    notifyListeners();
  }

  /// Clear all notifications
  void clearNotifications() {
    _notifications.clear();
    notifyListeners();
  }

  @override
  void dispose() {
    print('[NotificationProvider] Disposing...');
    _stopPeriodicFetch();
    _notificationSubscription?.cancel();
    _connectionSubscription?.cancel();
    _webSocketService.dispose();
    super.dispose();
  }
}

