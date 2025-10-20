// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_response_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

AuthResponseDto _$AuthResponseDtoFromJson(Map<String, dynamic> json) {
  return _AuthResponseDto.fromJson(json);
}

/// @nodoc
mixin _$AuthResponseDto {
  String get token => throw _privateConstructorUsedError;
  @JsonKey(name: 'id', fromJson: _readIdAsString)
  String get userId => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  @JsonKey(name: 'role')
  UserType get userType => throw _privateConstructorUsedError;
  @JsonKey(name: 'type')
  String? get tokenType => throw _privateConstructorUsedError;
  @JsonKey(name: 'email')
  String? get email => throw _privateConstructorUsedError;

  /// Serializes this AuthResponseDto to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AuthResponseDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AuthResponseDtoCopyWith<AuthResponseDto> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AuthResponseDtoCopyWith<$Res> {
  factory $AuthResponseDtoCopyWith(
    AuthResponseDto value,
    $Res Function(AuthResponseDto) then,
  ) = _$AuthResponseDtoCopyWithImpl<$Res, AuthResponseDto>;
  @useResult
  $Res call({
    String token,
    @JsonKey(name: 'id', fromJson: _readIdAsString) String userId,
    String username,
    @JsonKey(name: 'role') UserType userType,
    @JsonKey(name: 'type') String? tokenType,
    @JsonKey(name: 'email') String? email,
  });
}

/// @nodoc
class _$AuthResponseDtoCopyWithImpl<$Res, $Val extends AuthResponseDto>
    implements $AuthResponseDtoCopyWith<$Res> {
  _$AuthResponseDtoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AuthResponseDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? token = null,
    Object? userId = null,
    Object? username = null,
    Object? userType = null,
    Object? tokenType = freezed,
    Object? email = freezed,
  }) {
    return _then(
      _value.copyWith(
            token:
                null == token
                    ? _value.token
                    : token // ignore: cast_nullable_to_non_nullable
                        as String,
            userId:
                null == userId
                    ? _value.userId
                    : userId // ignore: cast_nullable_to_non_nullable
                        as String,
            username:
                null == username
                    ? _value.username
                    : username // ignore: cast_nullable_to_non_nullable
                        as String,
            userType:
                null == userType
                    ? _value.userType
                    : userType // ignore: cast_nullable_to_non_nullable
                        as UserType,
            tokenType:
                freezed == tokenType
                    ? _value.tokenType
                    : tokenType // ignore: cast_nullable_to_non_nullable
                        as String?,
            email:
                freezed == email
                    ? _value.email
                    : email // ignore: cast_nullable_to_non_nullable
                        as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AuthResponseDtoImplCopyWith<$Res>
    implements $AuthResponseDtoCopyWith<$Res> {
  factory _$$AuthResponseDtoImplCopyWith(
    _$AuthResponseDtoImpl value,
    $Res Function(_$AuthResponseDtoImpl) then,
  ) = __$$AuthResponseDtoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String token,
    @JsonKey(name: 'id', fromJson: _readIdAsString) String userId,
    String username,
    @JsonKey(name: 'role') UserType userType,
    @JsonKey(name: 'type') String? tokenType,
    @JsonKey(name: 'email') String? email,
  });
}

/// @nodoc
class __$$AuthResponseDtoImplCopyWithImpl<$Res>
    extends _$AuthResponseDtoCopyWithImpl<$Res, _$AuthResponseDtoImpl>
    implements _$$AuthResponseDtoImplCopyWith<$Res> {
  __$$AuthResponseDtoImplCopyWithImpl(
    _$AuthResponseDtoImpl _value,
    $Res Function(_$AuthResponseDtoImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AuthResponseDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? token = null,
    Object? userId = null,
    Object? username = null,
    Object? userType = null,
    Object? tokenType = freezed,
    Object? email = freezed,
  }) {
    return _then(
      _$AuthResponseDtoImpl(
        token:
            null == token
                ? _value.token
                : token // ignore: cast_nullable_to_non_nullable
                    as String,
        userId:
            null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                    as String,
        username:
            null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                    as String,
        userType:
            null == userType
                ? _value.userType
                : userType // ignore: cast_nullable_to_non_nullable
                    as UserType,
        tokenType:
            freezed == tokenType
                ? _value.tokenType
                : tokenType // ignore: cast_nullable_to_non_nullable
                    as String?,
        email:
            freezed == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AuthResponseDtoImpl implements _AuthResponseDto {
  const _$AuthResponseDtoImpl({
    required this.token,
    @JsonKey(name: 'id', fromJson: _readIdAsString) required this.userId,
    required this.username,
    @JsonKey(name: 'role') required this.userType,
    @JsonKey(name: 'type') this.tokenType,
    @JsonKey(name: 'email') this.email,
  });

  factory _$AuthResponseDtoImpl.fromJson(Map<String, dynamic> json) =>
      _$$AuthResponseDtoImplFromJson(json);

  @override
  final String token;
  @override
  @JsonKey(name: 'id', fromJson: _readIdAsString)
  final String userId;
  @override
  final String username;
  @override
  @JsonKey(name: 'role')
  final UserType userType;
  @override
  @JsonKey(name: 'type')
  final String? tokenType;
  @override
  @JsonKey(name: 'email')
  final String? email;

  @override
  String toString() {
    return 'AuthResponseDto(token: $token, userId: $userId, username: $username, userType: $userType, tokenType: $tokenType, email: $email)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AuthResponseDtoImpl &&
            (identical(other.token, token) || other.token == token) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.userType, userType) ||
                other.userType == userType) &&
            (identical(other.tokenType, tokenType) ||
                other.tokenType == tokenType) &&
            (identical(other.email, email) || other.email == email));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    token,
    userId,
    username,
    userType,
    tokenType,
    email,
  );

  /// Create a copy of AuthResponseDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AuthResponseDtoImplCopyWith<_$AuthResponseDtoImpl> get copyWith =>
      __$$AuthResponseDtoImplCopyWithImpl<_$AuthResponseDtoImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$AuthResponseDtoImplToJson(this);
  }
}

abstract class _AuthResponseDto implements AuthResponseDto {
  const factory _AuthResponseDto({
    required final String token,
    @JsonKey(name: 'id', fromJson: _readIdAsString)
    required final String userId,
    required final String username,
    @JsonKey(name: 'role') required final UserType userType,
    @JsonKey(name: 'type') final String? tokenType,
    @JsonKey(name: 'email') final String? email,
  }) = _$AuthResponseDtoImpl;

  factory _AuthResponseDto.fromJson(Map<String, dynamic> json) =
      _$AuthResponseDtoImpl.fromJson;

  @override
  String get token;
  @override
  @JsonKey(name: 'id', fromJson: _readIdAsString)
  String get userId;
  @override
  String get username;
  @override
  @JsonKey(name: 'role')
  UserType get userType;
  @override
  @JsonKey(name: 'type')
  String? get tokenType;
  @override
  @JsonKey(name: 'email')
  String? get email;

  /// Create a copy of AuthResponseDto
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AuthResponseDtoImplCopyWith<_$AuthResponseDtoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
