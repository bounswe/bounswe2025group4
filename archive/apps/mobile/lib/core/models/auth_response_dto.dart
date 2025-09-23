import 'package:freezed_annotation/freezed_annotation.dart';
import './user_type.dart'; // Assuming UserType enum is in the same directory

part 'auth_response_dto.freezed.dart';
part 'auth_response_dto.g.dart';

// Helper function to read the value (expected to be int or String) and convert to String
String _readIdAsString(dynamic value) {
  if (value is int) {
    return value.toString();
  } else if (value is String) {
    return value;
  } else if (value == null) {
    throw Exception('Missing required field: id');
  } else {
    throw Exception(
      'Invalid type for id field: expected int or String, got ${value.runtimeType}',
    );
  }
}

@freezed
class AuthResponseDto with _$AuthResponseDto {
  const factory AuthResponseDto({
    required String token,
    @JsonKey(name: 'id', fromJson: _readIdAsString) required String userId,
    required String username,
    required UserType userType,
  }) = _AuthResponseDto;

  factory AuthResponseDto.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseDtoFromJson(json);
}
