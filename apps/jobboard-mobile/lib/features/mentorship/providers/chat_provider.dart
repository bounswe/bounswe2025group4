import 'package:flutter/foundation.dart';
import 'package:mobile/features/mentorship/services/stomp_chat_service.dart';
import 'package:mobile/core/models/chat_message.dart';
import 'package:mobile/core/services/api_service.dart';

class ChatProvider with ChangeNotifier {
  final StompChatService _chatService;
  final ApiService _apiService;

  ChatProvider({
    required StompChatService chatService,
    required ApiService apiService,
  })  : _chatService = chatService,
        _apiService = apiService;

  final List<ChatMessage> _messages = [];
  bool _isConnected = false;
  bool _isLoading = false;
  String? _error;

  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isConnected => _isConnected;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Connect to chat
  Future<void> connect({
    required String jwtToken,
    required int conversationId,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    // 🔹 LOAD HISTORY EVERY TIME
    try {
      final history = await _apiService.getChatHistory(
        conversationId: conversationId,
      );

      _messages
        ..clear()
        ..addAll(history);
    } catch (e) {
      _error = e.toString();
    }

    // 🔹 CONNECT STOMP - always disconnect first to ensure clean state
    // This ensures backend knows user is not subscribed when they leave
    if (_chatService.isConnected) {
      debugPrint('[ChatProvider] Disconnecting existing connection before connecting to new conversation');
      _chatService.disconnect();
      // Wait a bit for disconnect to complete
      await Future.delayed(const Duration(milliseconds: 300));
    }
    
    _chatService.connect(
      jwtToken: jwtToken,
      conversationId: conversationId,
      onConnected: () {
        debugPrint('[ChatProvider] Connected to conversation $conversationId');
        _isConnected = true;
        _isLoading = false;
        notifyListeners();
      },
      onMessage: _handleIncomingMessage,
      onError: _handleError,
    );
  }

  void _handleIncomingMessage(Map<String, dynamic> data) {
    final msg = ChatMessage.fromJson(data);
    if (_messages.any((m) => m.id == msg.id)) return;
    _messages.add(msg);
    notifyListeners();
  }

  void _handleError(dynamic err) {
    _error = err.toString();
    _isConnected = false;
    _isLoading = false;
    notifyListeners();
  }

  /// Send message
  void sendMessage({
    required int conversationId,
    required String content,
  }) {
    _chatService.sendMessage(
      conversationId: conversationId,
      content: content,
    );
  }

  /// Disconnect chat
  void disconnect() {
    debugPrint('[ChatProvider] Disconnecting chat');
    _chatService.disconnect();
    _isConnected = false;
    _messages.clear(); // Clear messages when disconnecting
    notifyListeners();
  }

  /// Clear messages (optional)
  void clearMessages() {
    _messages.clear();
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
