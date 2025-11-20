import '../models/employer_request.dart';

/// Model for paginated employer request response
class PaginatedEmployerRequestResponse {
  final List<EmployerRequest> content;
  final int page;
  final int size;
  final int totalElements;
  final int totalPages;
  final bool hasNext;
  final bool hasPrevious;

  PaginatedEmployerRequestResponse({
    required this.content,
    required this.page,
    required this.size,
    required this.totalElements,
    required this.totalPages,
    required this.hasNext,
    required this.hasPrevious,
  });

  factory PaginatedEmployerRequestResponse.fromJson(Map<String, dynamic> json) {
    return PaginatedEmployerRequestResponse(
      content:
          (json['content'] as List)
              .map((e) => EmployerRequest.fromJson(e as Map<String, dynamic>))
              .toList(),
      page: json['page'] as int,
      size: json['size'] as int,
      totalElements: json['totalElements'] as int,
      totalPages: json['totalPages'] as int,
      hasNext: json['hasNext'] as bool,
      hasPrevious: json['hasPrevious'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'content': content.map((e) => e.toJson()).toList(),
      'page': page,
      'size': size,
      'totalElements': totalElements,
      'totalPages': totalPages,
      'hasNext': hasNext,
      'hasPrevious': hasPrevious,
    };
  }
}
