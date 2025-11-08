/// Model for employer request
class EmployerRequest {
  final int id;
  final int workplaceId;
  final int createdByUserId;
  final String? createdByUsername;
  final String status;
  final String? note;
  final DateTime createdAt;
  final DateTime updatedAt;

  EmployerRequest({
    required this.id,
    required this.workplaceId,
    required this.createdByUserId,
    this.createdByUsername,
    required this.status,
    this.note,
    required this.createdAt,
    required this.updatedAt,
  });

  factory EmployerRequest.fromJson(Map<String, dynamic> json) {
    // Try multiple possible field names for username
    final username =
        json['createdByUsername'] as String? ??
        json['username'] as String? ??
        json['requesterUsername'] as String? ??
        json['createdBy'] as String?;

    return EmployerRequest(
      id: json['id'] as int,
      workplaceId: json['workplaceId'] as int,
      createdByUserId: json['createdByUserId'] as int,
      createdByUsername: username,
      status: json['status'] as String,
      note: json['note'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workplaceId': workplaceId,
      'createdByUserId': createdByUserId,
      'status': status,
      if (note != null) 'note': note,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
