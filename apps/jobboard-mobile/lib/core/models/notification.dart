class Notification {
  final int id;
  final String title;
  final String notificationType;
  final String message;
  final int timestamp;
  final bool read;
  final String? username;
  final int? linkId;

  Notification({
    required this.id,
    required this.title,
    required this.notificationType,
    required this.message,
    required this.timestamp,
    required this.read,
    this.username,
    this.linkId,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'] as int,
      title: json['title'] as String,
      notificationType: json['notificationType'] as String,
      message: json['message'] as String,
      timestamp: json['timestamp'] as int,
      read: json['read'] as bool,
      username: json['username'] as String?,
      linkId: json['linkId'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'notificationType': notificationType,
      'message': message,
      'timestamp': timestamp,
      'read': read,
      'username': username,
      'linkId': linkId,
    };
  }

  Notification copyWith({
    int? id,
    String? title,
    String? notificationType,
    String? message,
    int? timestamp,
    bool? read,
    String? username,
    int? linkId,
  }) {
    return Notification(
      id: id ?? this.id,
      title: title ?? this.title,
      notificationType: notificationType ?? this.notificationType,
      message: message ?? this.message,
      timestamp: timestamp ?? this.timestamp,
      read: read ?? this.read,
      username: username ?? this.username,
      linkId: linkId ?? this.linkId,
    );
  }
}

