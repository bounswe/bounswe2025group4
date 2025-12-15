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
    if (_isConnected) {
      print('[NotificationWebSocket] Already connected');
      return;
    }

    _token = token;
    _username = username;

    try {
      // Convert HTTPS to WebSocket URL
      final wsUrl = AppConstants.baseUrl
          .replaceFirst('https://', 'wss://')
          .replaceFirst('http://', 'ws://');
      
      final url = '$wsUrl/ws-chat';
      
      print('[NotificationWebSocket] Connecting to STOMP: $url');
      
      _stompClient = StompClient(
        config: StompConfig(
          url: url,
          onConnect: _onConnect,
          onWebSocketError: (dynamic error) {
            print('[NotificationWebSocket] WebSocket error: $error');
            _onError(error);
          },
          onStompError: (StompFrame frame) {
            print('[NotificationWebSocket] STOMP error: ${frame.body}');
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
    _isConnected = true;
    _reconnectAttempts = 0;
    _connectionStatusController.add(true);
    
    // Subscribe to broadcast notifications
    _stompClient!.subscribe(
      destination: '/topic/notifications',
      callback: (StompFrame frame) {
        _handleNotificationFrame(frame);
      },
    );
    
    // Subscribe to user-specific notifications
    _stompClient!.subscribe(
      destination: '/user/queue/notifications',
      callback: (StompFrame frame) {
        _handleNotificationFrame(frame);
      },
    );
    
    print('[NotificationWebSocket] Subscribed to notification channels');
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

