/// Model for delete response
class DeleteResponse {
  final String message;
  final String code;
  final DateTime timestamp;

  DeleteResponse({
    required this.message,
    required this.code,
    required this.timestamp,
  });

  factory DeleteResponse.fromJson(Map<String, dynamic> json) {
    return DeleteResponse(
      message: json['message'] as String,
      code: json['code'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message': message,
      'code': code,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
