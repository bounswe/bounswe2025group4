import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:mobile/core/constants/app_constants.dart';

class StompChatService {
  StompClient? _client;
  int? _currentConversationId;
  String? _jwtToken;

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
          debugPrint('Subscribed to /topic/conversation/$conversationId');

          _client!.subscribe(
            destination: '/topic/conversation/$conversationId',
            callback: (frame) {
              if (frame.body == null) return;
              onMessage(jsonDecode(frame.body!));
            },
          );

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
    if (_client == null) return;

    debugPrint('Disconnecting STOMP');
    _client!.deactivate();
    _client = null;
    _currentConversationId = null;
  }
}
