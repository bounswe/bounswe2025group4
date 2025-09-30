import 'dart:convert';
import 'user.dart';

enum MentorshipRequestStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
  COMPLETED,
  CANCELLED,
}

class MentorshipRequest {
  final int id;
  final User mentor;
  final User mentee;
  final String message;
  final MentorshipRequestStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? channelId;

  MentorshipRequest({
    required this.id,
    required this.mentor,
    required this.mentee,
    required this.message,
    required this.status,
    required this.createdAt,
    this.updatedAt,
    this.channelId,
  });

  factory MentorshipRequest.fromJson(Map<String, dynamic> json) {
    return MentorshipRequest(
      id: json['id'],
      mentor: User.fromJson(json['mentor']),
      mentee: User.fromJson(json['mentee']),
      message: json['message'],
      status: MentorshipRequestStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => MentorshipRequestStatus.PENDING,
      ),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt:
          json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      channelId: json['channelId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mentor': mentor,
      'mentee': mentee,
      'message': message,
      'status': status.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'channelId': channelId,
    };
  }
}
