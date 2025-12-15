class NotificationMessage {
  final String title;
  final String notificationType;
  final String message;
  final int timestamp;
  final String? username;
  final int? linkId;

  NotificationMessage({
    required this.title,
    required this.notificationType,
    required this.message,
    required this.timestamp,
    this.username,
    this.linkId,
  });

  factory NotificationMessage.fromJson(Map<String, dynamic> json) {
    return NotificationMessage(
      title: json['title'] as String,
      notificationType: json['notificationType'] as String,
      message: json['message'] as String,
      timestamp: json['timestamp'] as int,
      username: json['username'] as String?,
      linkId: json['linkId'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'notificationType': notificationType,
      'message': message,
      'timestamp': timestamp,
      'username': username,
      'linkId': linkId,
    };
  }
}

