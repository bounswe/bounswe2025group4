import 'package:freezed_annotation/freezed_annotation.dart';
import './user_type.dart'; // Assuming UserType enum is in the same directory

part 'auth_response_dto.freezed.dart';
part 'auth_response_dto.g.dart';

@freezed
class AuthResponseDto with _$AuthResponseDto {
  const factory AuthResponseDto({
    required String token,
    required String username,
    required UserType userType,
  }) = _AuthResponseDto;

  factory AuthResponseDto.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseDtoFromJson(json);
}
