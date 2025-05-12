import 'package:freezed_annotation/freezed_annotation.dart';
import './user_type.dart';
import './mentorship_status.dart';

part 'register_request_dto.freezed.dart';
part 'register_request_dto.g.dart';

@freezed
class RegisterRequestDto with _$RegisterRequestDto {
  const factory RegisterRequestDto({
    required String username,
    required String email,
    required String password,
    String? bio,
    required UserType userType, // Ensure UserType enum is imported
    MentorshipStatus? mentorshipStatus,
    int? maxMenteeCount,
  }) = _RegisterRequestDto;

  factory RegisterRequestDto.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestDtoFromJson(json);
}
