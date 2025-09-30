import 'package:freezed_annotation/freezed_annotation.dart';
import './user_type.dart';

part 'user_dto.freezed.dart';
part 'user_dto.g.dart';

@freezed
class UserDto with _$UserDto {
  const factory UserDto({
    required int id,
    required String username,
    required String email,
    String? bio,
    required UserType userType,
  }) = _UserDto;

  factory UserDto.fromJson(Map<String, dynamic> json) =>
      _$UserDtoFromJson(json);
}
