class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final String senderUsername;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.senderUsername,
    required this.timestamp,

  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['conversationId'] as String,
      senderId: json['senderId'] as String,
      content: json['content'] as String,
      senderUsername: json['senderUsername'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}
