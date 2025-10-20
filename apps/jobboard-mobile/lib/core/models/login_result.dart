// lib/core/models/login_result.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:mobile/core/models/auth_response_dto.dart';

part 'login_result.freezed.dart';

@freezed
sealed class LoginResult with _$LoginResult {
  const factory LoginResult.success(AuthResponseDto auth) = LoginSuccess;
  const factory LoginResult.needsOtp({
    required String username,
    required String temporaryToken,
    String? message,
  }) = LoginNeedsOtp;
}
