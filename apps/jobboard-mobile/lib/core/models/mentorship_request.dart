import 'dart:convert';
import 'user.dart';
enum MentorshipRequestStatus { PENDING, ACCEPTED, REJECTED, CANCELLED }

class MentorshipRequest {
  final String id;
  final String requesterId;
  final String mentorId;
  final String? mentorUsername; // Populated in Mentee View
  final MentorshipRequestStatus status;
  final DateTime createdAt;

  // Fields specific to the Mentee Composite View
  final int? resumeReviewId;
  final int? conversationId;

  MentorshipRequest({
    required this.id,
    required this.requesterId,
    required this.mentorId,
    required this.status,
    required this.createdAt,
    this.mentorUsername,
    this.resumeReviewId,
    this.conversationId,
  });

  // Factory for Standard Response (GET /api/mentorship/requests/{id} or Mentor View)
  factory MentorshipRequest.fromJson(Map<String, dynamic> json) {
    return MentorshipRequest(
      id: json['id']?.toString() ?? '',
      requesterId: json['requesterId']?.toString() ?? '',
      mentorId: json['mentorId']?.toString() ?? '',
      status: _parseStatus(json['status']),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  // Factory for Mentee Composite View (GET /api/mentorship/mentee/{id}/requests)
  factory MentorshipRequest.fromMenteeViewJson(Map<String, dynamic> json) {
    return MentorshipRequest(
      id: json['mentorshipRequestId']?.toString() ?? '',
      requesterId: '', // Not provided in this view, implied to be current user
      mentorId: json['mentorId']?.toString() ?? '',
      mentorUsername: json['mentorUsername'],
      status: _parseStatus(json['requestStatus']),
      createdAt: DateTime.parse(json['requestCreatedAt']),
      resumeReviewId: json['resumeReviewId'],
      conversationId: json['conversationId'],
    );
  }

  static MentorshipRequestStatus _parseStatus(String? status) {
    if (status == null) return MentorshipRequestStatus.PENDING;
    try {
      return MentorshipRequestStatus.values.byName(status.toUpperCase());
    } catch (e) {
      return MentorshipRequestStatus.PENDING;
    }
  }
}