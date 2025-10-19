// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'login_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$LoginResult {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(AuthResponseDto auth) success,
    required TResult Function(
      String username,
      String temporaryToken,
      String? message,
    )
    needsOtp,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(AuthResponseDto auth)? success,
    TResult? Function(String username, String temporaryToken, String? message)?
    needsOtp,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(AuthResponseDto auth)? success,
    TResult Function(String username, String temporaryToken, String? message)?
    needsOtp,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoginSuccess value) success,
    required TResult Function(LoginNeedsOtp value) needsOtp,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoginSuccess value)? success,
    TResult? Function(LoginNeedsOtp value)? needsOtp,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoginSuccess value)? success,
    TResult Function(LoginNeedsOtp value)? needsOtp,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LoginResultCopyWith<$Res> {
  factory $LoginResultCopyWith(
    LoginResult value,
    $Res Function(LoginResult) then,
  ) = _$LoginResultCopyWithImpl<$Res, LoginResult>;
}

/// @nodoc
class _$LoginResultCopyWithImpl<$Res, $Val extends LoginResult>
    implements $LoginResultCopyWith<$Res> {
  _$LoginResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$LoginSuccessImplCopyWith<$Res> {
  factory _$$LoginSuccessImplCopyWith(
    _$LoginSuccessImpl value,
    $Res Function(_$LoginSuccessImpl) then,
  ) = __$$LoginSuccessImplCopyWithImpl<$Res>;
  @useResult
  $Res call({AuthResponseDto auth});

  $AuthResponseDtoCopyWith<$Res> get auth;
}

/// @nodoc
class __$$LoginSuccessImplCopyWithImpl<$Res>
    extends _$LoginResultCopyWithImpl<$Res, _$LoginSuccessImpl>
    implements _$$LoginSuccessImplCopyWith<$Res> {
  __$$LoginSuccessImplCopyWithImpl(
    _$LoginSuccessImpl _value,
    $Res Function(_$LoginSuccessImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? auth = null}) {
    return _then(
      _$LoginSuccessImpl(
        null == auth
            ? _value.auth
            : auth // ignore: cast_nullable_to_non_nullable
                as AuthResponseDto,
      ),
    );
  }

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $AuthResponseDtoCopyWith<$Res> get auth {
    return $AuthResponseDtoCopyWith<$Res>(_value.auth, (value) {
      return _then(_value.copyWith(auth: value));
    });
  }
}

/// @nodoc

class _$LoginSuccessImpl implements LoginSuccess {
  const _$LoginSuccessImpl(this.auth);

  @override
  final AuthResponseDto auth;

  @override
  String toString() {
    return 'LoginResult.success(auth: $auth)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LoginSuccessImpl &&
            (identical(other.auth, auth) || other.auth == auth));
  }

  @override
  int get hashCode => Object.hash(runtimeType, auth);

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LoginSuccessImplCopyWith<_$LoginSuccessImpl> get copyWith =>
      __$$LoginSuccessImplCopyWithImpl<_$LoginSuccessImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(AuthResponseDto auth) success,
    required TResult Function(
      String username,
      String temporaryToken,
      String? message,
    )
    needsOtp,
  }) {
    return success(auth);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(AuthResponseDto auth)? success,
    TResult? Function(String username, String temporaryToken, String? message)?
    needsOtp,
  }) {
    return success?.call(auth);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(AuthResponseDto auth)? success,
    TResult Function(String username, String temporaryToken, String? message)?
    needsOtp,
    required TResult orElse(),
  }) {
    if (success != null) {
      return success(auth);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoginSuccess value) success,
    required TResult Function(LoginNeedsOtp value) needsOtp,
  }) {
    return success(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoginSuccess value)? success,
    TResult? Function(LoginNeedsOtp value)? needsOtp,
  }) {
    return success?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoginSuccess value)? success,
    TResult Function(LoginNeedsOtp value)? needsOtp,
    required TResult orElse(),
  }) {
    if (success != null) {
      return success(this);
    }
    return orElse();
  }
}

abstract class LoginSuccess implements LoginResult {
  const factory LoginSuccess(final AuthResponseDto auth) = _$LoginSuccessImpl;

  AuthResponseDto get auth;

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LoginSuccessImplCopyWith<_$LoginSuccessImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$LoginNeedsOtpImplCopyWith<$Res> {
  factory _$$LoginNeedsOtpImplCopyWith(
    _$LoginNeedsOtpImpl value,
    $Res Function(_$LoginNeedsOtpImpl) then,
  ) = __$$LoginNeedsOtpImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String username, String temporaryToken, String? message});
}

/// @nodoc
class __$$LoginNeedsOtpImplCopyWithImpl<$Res>
    extends _$LoginResultCopyWithImpl<$Res, _$LoginNeedsOtpImpl>
    implements _$$LoginNeedsOtpImplCopyWith<$Res> {
  __$$LoginNeedsOtpImplCopyWithImpl(
    _$LoginNeedsOtpImpl _value,
    $Res Function(_$LoginNeedsOtpImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? username = null,
    Object? temporaryToken = null,
    Object? message = freezed,
  }) {
    return _then(
      _$LoginNeedsOtpImpl(
        username:
            null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                    as String,
        temporaryToken:
            null == temporaryToken
                ? _value.temporaryToken
                : temporaryToken // ignore: cast_nullable_to_non_nullable
                    as String,
        message:
            freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc

class _$LoginNeedsOtpImpl implements LoginNeedsOtp {
  const _$LoginNeedsOtpImpl({
    required this.username,
    required this.temporaryToken,
    this.message,
  });

  @override
  final String username;
  @override
  final String temporaryToken;
  @override
  final String? message;

  @override
  String toString() {
    return 'LoginResult.needsOtp(username: $username, temporaryToken: $temporaryToken, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LoginNeedsOtpImpl &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.temporaryToken, temporaryToken) ||
                other.temporaryToken == temporaryToken) &&
            (identical(other.message, message) || other.message == message));
  }

  @override
  int get hashCode =>
      Object.hash(runtimeType, username, temporaryToken, message);

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LoginNeedsOtpImplCopyWith<_$LoginNeedsOtpImpl> get copyWith =>
      __$$LoginNeedsOtpImplCopyWithImpl<_$LoginNeedsOtpImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(AuthResponseDto auth) success,
    required TResult Function(
      String username,
      String temporaryToken,
      String? message,
    )
    needsOtp,
  }) {
    return needsOtp(username, temporaryToken, message);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(AuthResponseDto auth)? success,
    TResult? Function(String username, String temporaryToken, String? message)?
    needsOtp,
  }) {
    return needsOtp?.call(username, temporaryToken, message);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(AuthResponseDto auth)? success,
    TResult Function(String username, String temporaryToken, String? message)?
    needsOtp,
    required TResult orElse(),
  }) {
    if (needsOtp != null) {
      return needsOtp(username, temporaryToken, message);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoginSuccess value) success,
    required TResult Function(LoginNeedsOtp value) needsOtp,
  }) {
    return needsOtp(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoginSuccess value)? success,
    TResult? Function(LoginNeedsOtp value)? needsOtp,
  }) {
    return needsOtp?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoginSuccess value)? success,
    TResult Function(LoginNeedsOtp value)? needsOtp,
    required TResult orElse(),
  }) {
    if (needsOtp != null) {
      return needsOtp(this);
    }
    return orElse();
  }
}

abstract class LoginNeedsOtp implements LoginResult {
  const factory LoginNeedsOtp({
    required final String username,
    required final String temporaryToken,
    final String? message,
  }) = _$LoginNeedsOtpImpl;

  String get username;
  String get temporaryToken;
  String? get message;

  /// Create a copy of LoginResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LoginNeedsOtpImplCopyWith<_$LoginNeedsOtpImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
