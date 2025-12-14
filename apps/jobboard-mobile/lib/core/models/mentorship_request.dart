import 'dart:convert';
import 'user.dart';
enum MentorshipRequestStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
  CANCELLED,
  COMPLETED,
  UNKNOWN,
}

MentorshipRequestStatus _parseStatus(String? raw) {
  if (raw == null) return MentorshipRequestStatus.UNKNOWN;
  final upper = raw.toUpperCase();
  switch (upper) {
    case 'PENDING':
      return MentorshipRequestStatus.PENDING;
    case 'ACCEPTED':
      return MentorshipRequestStatus.ACCEPTED;
    case 'REJECTED':
      return MentorshipRequestStatus.REJECTED;
    case 'CANCELLED':
      return MentorshipRequestStatus.CANCELLED;
    case 'COMPLETED':
      return MentorshipRequestStatus.COMPLETED;
    default:
      return MentorshipRequestStatus.UNKNOWN;
  }
}
class MentorshipRequest {
  /// Primary ID (string for generic requests, mentee view `mentorshipRequestId`)
  final String id;

  /// Requester user ID (if present in response)
  final String? requesterId;
  String? requesterUsername;


  /// Mentor user ID (string or int in payload; normalized to string)
  final String mentorId;

  /// Request status
  final MentorshipRequestStatus status;

  /// When the request was created
  final DateTime createdAt;

  /// Extra mentee-view fields:
  final String? mentorUsername;
  final int? resumeReviewId;
  final String? reviewStatus;
  final int? conversationId;
  final String? motivation;

  MentorshipRequest({
    required this.id,
    required this.requesterId,
    required this.requesterUsername,
    required this.mentorId,
    required this.status,
    required this.createdAt,
    this.mentorUsername,
    this.resumeReviewId,
    this.reviewStatus,
    this.conversationId,
    this.motivation,

  });

  factory MentorshipRequest.fromJson(Map<String, dynamic> json) {
    // Normalize ID
    final id = (json['id'] ?? json['mentorshipRequestId']).toString();

    // Normalize status
    final rawStatus = json['status'] ?? json['requestStatus'];

    // Normalize createdAt
    final rawCreatedAt = json['createdAt'] ?? json['requestCreatedAt'];

    return MentorshipRequest(
      id: id,
      requesterId: json['requesterId']?.toString(),
      requesterUsername: json['requesterUsername']?.toString(),
      mentorId: json['mentorId']?.toString() ?? '',
      status: _parseStatus(rawStatus?.toString()),
      createdAt: DateTime.parse(rawCreatedAt as String),

      // Optional / mentee-only fields
      mentorUsername: json['mentorUsername']?.toString(),
      resumeReviewId: json['resumeReviewId'] as int?,
      reviewStatus: json['reviewStatus']?.toString(),
      conversationId: json['conversationId'] as int?,
      motivation: json['motivation']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requesterId': requesterId,
      'requesterUsername': requesterUsername,
      'mentorId': mentorId,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'mentorUsername': mentorUsername,
      'resumeReviewId': resumeReviewId,
      'reviewStatus': reviewStatus,
      'conversationId': conversationId,
      'motivation': motivation,
    };
  }
}