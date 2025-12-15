import 'dart:async';
import 'dart:convert';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../models/notification_message.dart';
import '../constants/app_constants.dart';

/// Service for handling STOMP WebSocket connections for real-time notifications
class NotificationWebSocketService {
  StompClient? _stompClient;
  final _notificationController = StreamController<NotificationMessage>.broadcast();
  final _connectionStatusController = StreamController<bool>.broadcast();
  
  bool _isConnected = false;
  String? _token;
  String? _username;
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 3);

  /// Stream of incoming notification messages
  Stream<NotificationMessage> get notificationStream => _notificationController.stream;

  /// Stream of connection status changes
  Stream<bool> get connectionStatusStream => _connectionStatusController.stream;

  /// Check if WebSocket is connected
  bool get isConnected => _isConnected;

  /// Connect to the STOMP WebSocket server
  Future<void> connect(String token, String username) async {
    // If already connected with same credentials, do nothing
    if (_isConnected && _token == token && _username == username) {
      print('[NotificationWebSocket] Already connected with same credentials');
      return;
    }

    // If connected with different credentials, disconnect first
    if (_isConnected && (_token != token || _username != username)) {
      print('[NotificationWebSocket] Credentials changed, reconnecting...');
      disconnect();
      // Wait a bit for disconnect to complete
      await Future.delayed(const Duration(milliseconds: 500));
    }

    _token = token;
    _username = username;

    try {
      // Use the same WebSocket URL as StompChatService
      final url = AppConstants.baseWsUrl;
      
      print('[NotificationWebSocket] Connecting to STOMP: $url');
      print('[NotificationWebSocket] Token: ${token.substring(0, 20)}...');
      print('[NotificationWebSocket] Username: $username');
      
      _stompClient = StompClient(
        config: StompConfig(
          url: url,
          useSockJS: false, // Same as StompChatService - connects directly to websocket endpoint
          onConnect: _onConnect,
          onWebSocketError: (dynamic error) {
            print('[NotificationWebSocket] WebSocket error: $error');
            print('[NotificationWebSocket] Error type: ${error.runtimeType}');
            _onError(error);
          },
          onStompError: (StompFrame frame) {
            print('[NotificationWebSocket] STOMP error: ${frame.body}');
            print('[NotificationWebSocket] STOMP error headers: ${frame.headers}');
            _onError(frame.body ?? 'STOMP error');
          },
          onDisconnect: (StompFrame? frame) {
            print('[NotificationWebSocket] Disconnected');
            _onDone();
          },
          stompConnectHeaders: {
            'Authorization': 'Bearer $token',
          },
          webSocketConnectHeaders: {
            'Authorization': 'Bearer $token',
          },
        ),
      );
      
      _stompClient!.activate();
    } catch (e) {
      print('[NotificationWebSocket] Connection error: $e');
      _isConnected = false;
      _connectionStatusController.add(false);
      _scheduleReconnect();
    }
  }

  /// Handle successful connection
  void _onConnect(StompFrame frame) {
    print('[NotificationWebSocket] Connected successfully');
    print('[NotificationWebSocket] Frame headers: ${frame.headers}');
    _isConnected = true;
    _reconnectAttempts = 0;
    _connectionStatusController.add(true);
    
    try {
      // Subscribe to broadcast notifications
      _stompClient!.subscribe(
        destination: '/topic/notifications',
        callback: (StompFrame frame) {
          print('[NotificationWebSocket] Received message on /topic/notifications');
          _handleNotificationFrame(frame);
        },
      );
      
      // Subscribe to user-specific notifications
      // Spring STOMP automatically converts /user/queue/notifications to /queue/notifications for the authenticated user
      _stompClient!.subscribe(
        destination: '/user/queue/notifications',
        callback: (StompFrame frame) {
          print('[NotificationWebSocket] Received message on /user/queue/notifications');
          _handleNotificationFrame(frame);
        },
      );
      
      print('[NotificationWebSocket] Subscribed to notification channels');
      print('[NotificationWebSocket] Listening for notifications from user: $_username');
    } catch (e) {
      print('[NotificationWebSocket] Error subscribing to channels: $e');
    }
  }

  /// Handle incoming notification frame
  void _handleNotificationFrame(StompFrame frame) {
    try {
      if (frame.body == null || frame.body!.isEmpty) {
        return;
      }
      
      print('[NotificationWebSocket] Received message: ${frame.body}');
      
      final Map<String, dynamic> data = jsonDecode(frame.body!);
      final notification = NotificationMessage.fromJson(data);
      
      print('[NotificationWebSocket] Parsed notification: ${notification.title}');
      _notificationController.add(notification);
    } catch (e) {
      print('[NotificationWebSocket] Error parsing message: $e');
    }
  }

  /// Handle WebSocket errors
  void _onError(dynamic error) {
    print('[NotificationWebSocket] Error: $error');
    _isConnected = false;
    _connectionStatusController.add(false);
    _scheduleReconnect();
  }

  /// Handle WebSocket connection close
  void _onDone() {
    print('[NotificationWebSocket] Connection closed');
    _isConnected = false;
    _connectionStatusController.add(false);
    _scheduleReconnect();
  }

  /// Schedule a reconnection attempt
  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      print('[NotificationWebSocket] Max reconnect attempts reached');
      return;
    }

    _reconnectTimer?.cancel();
    _reconnectAttempts++;
    
    print('[NotificationWebSocket] Scheduling reconnect attempt $_reconnectAttempts in ${_reconnectDelay.inSeconds}s');
    
    _reconnectTimer = Timer(_reconnectDelay, () {
      if (_token != null && _username != null && !_isConnected) {
        print('[NotificationWebSocket] Attempting to reconnect...');
        connect(_token!, _username!);
      }
    });
  }

  /// Disconnect from the WebSocket server
  void disconnect() {
    print('[NotificationWebSocket] Disconnecting...');
    _reconnectTimer?.cancel();
    _reconnectAttempts = _maxReconnectAttempts; // Prevent auto-reconnect
    
    if (_stompClient != null) {
      _stompClient!.deactivate();
      _stompClient = null;
    }
    
    _isConnected = false;
    _connectionStatusController.add(false);
    _token = null;
    _username = null;
  }

  /// Dispose of the service and close all resources
  void dispose() {
    print('[NotificationWebSocket] Disposing...');
    disconnect();
    _notificationController.close();
    _connectionStatusController.close();
  }
}

