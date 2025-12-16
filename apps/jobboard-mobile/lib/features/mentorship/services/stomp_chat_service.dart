import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:mobile/core/constants/app_constants.dart';

class StompChatService {
  StompClient? _client;
  int? _currentConversationId;
  String? _jwtToken;
  void Function({Map<String, String>? unsubscribeHeaders})? _unsubscribeFn; // Track unsubscribe function

  bool get isConnected =>
      _client != null && _client!.connected == true;

  void connect({
    required String jwtToken,
    required int conversationId,
    required void Function(Map<String, dynamic>) onMessage,
    void Function()? onConnected,
    void Function(dynamic error)? onError,
  }) {
    _jwtToken = jwtToken;
    // ALREADY CONNECTED TO SAME CONVERSATION → DO NOTHING
    if (isConnected && _currentConversationId == conversationId) {
      debugPrint('Already connected to conversation $conversationId');
      return;
    }

    // CONNECTED TO DIFFERENT CONVERSATION → CLEAN DISCONNECT
    if (isConnected) {
      disconnect();
    }

    _currentConversationId = conversationId;

    _client = StompClient(
      config: StompConfig(
        url: AppConstants.baseWsUrl,
        useSockJS: false,
        stompConnectHeaders: {
          'Authorization': 'Bearer $jwtToken',
        },
        webSocketConnectHeaders: {
          'Authorization': 'Bearer $jwtToken',
        },
        onConnect: (_) {
          debugPrint('STOMP connected');
          debugPrint('Subscribing to /topic/conversation/$conversationId');

          // Subscribe and save unsubscribe function for proper cleanup
          _unsubscribeFn = _client!.subscribe(
            destination: '/topic/conversation/$conversationId',
            callback: (frame) {
              if (frame.body == null) return;
              onMessage(jsonDecode(frame.body!));
            },
          );
          
          debugPrint('Subscribed to /topic/conversation/$conversationId');

          onConnected?.call();
        },
        onWebSocketError: (error) {
          debugPrint('WebSocket error: $error');
          if (onError != null) {
            onError(error);
          }
        },
        onStompError: (frame) {
          debugPrint('STOMP error: ${frame.body}');
          if (onError != null) {
            onError(frame.body);
          }
        },
      ),
    );

    _client!.activate();
  }

  void sendMessage({
    required int conversationId,
    required String content,
  }) {
    if (!isConnected) return;

    _client!.send(
      destination: '/app/chat.sendMessage/$conversationId',
      body: jsonEncode({'content': content}),
      headers: {
        'Authorization': 'Bearer $_jwtToken',
      },

    );

  }

  void disconnect() {
    if (_client == null) {
      debugPrint('[StompChatService] Already disconnected');
      return;
    }

    debugPrint('[StompChatService] Disconnecting STOMP for conversation $_currentConversationId');
    
    try {
      // Unsubscribe from the topic first to notify backend
      if (_unsubscribeFn != null && _client!.connected) {
        try {
          _unsubscribeFn!();
          debugPrint('[StompChatService] Unsubscribed from conversation $_currentConversationId');
        } catch (e) {
          debugPrint('[StompChatService] Error unsubscribing: $e');
        }
      }
      
      // Small delay to ensure unsubscribe message is sent
      Future.delayed(const Duration(milliseconds: 100), () {
        try {
          if (_client != null) {
            _client!.deactivate();
            debugPrint('[StompChatService] STOMP deactivated successfully');
          }
        } catch (e) {
          debugPrint('[StompChatService] Error during deactivate: $e');
        }
      });
    } catch (e) {
      debugPrint('[StompChatService] Error during disconnect: $e');
    } finally {
      _unsubscribeFn = null;
      _currentConversationId = null;
      // Don't set _client to null immediately - let deactivate complete
      Future.delayed(const Duration(milliseconds: 200), () {
        _client = null;
        debugPrint('[StompChatService] Disconnect completed');
      });
    }
  }
}
