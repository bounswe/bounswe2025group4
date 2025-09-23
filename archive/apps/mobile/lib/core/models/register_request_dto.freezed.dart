// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'register_request_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

RegisterRequestDto _$RegisterRequestDtoFromJson(Map<String, dynamic> json) {
  return _RegisterRequestDto.fromJson(json);
}

/// @nodoc
mixin _$RegisterRequestDto {
  String get username => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String get password => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  UserType get userType =>
      throw _privateConstructorUsedError; // Ensure UserType enum is imported
  MentorshipStatus? get mentorshipStatus => throw _privateConstructorUsedError;
  int? get maxMenteeCount => throw _privateConstructorUsedError;

  /// Serializes this RegisterRequestDto to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RegisterRequestDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RegisterRequestDtoCopyWith<RegisterRequestDto> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RegisterRequestDtoCopyWith<$Res> {
  factory $RegisterRequestDtoCopyWith(
    RegisterRequestDto value,
    $Res Function(RegisterRequestDto) then,
  ) = _$RegisterRequestDtoCopyWithImpl<$Res, RegisterRequestDto>;
  @useResult
  $Res call({
    String username,
    String email,
    String password,
    String? bio,
    UserType userType,
    MentorshipStatus? mentorshipStatus,
    int? maxMenteeCount,
  });
}

/// @nodoc
class _$RegisterRequestDtoCopyWithImpl<$Res, $Val extends RegisterRequestDto>
    implements $RegisterRequestDtoCopyWith<$Res> {
  _$RegisterRequestDtoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RegisterRequestDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? username = null,
    Object? email = null,
    Object? password = null,
    Object? bio = freezed,
    Object? userType = null,
    Object? mentorshipStatus = freezed,
    Object? maxMenteeCount = freezed,
  }) {
    return _then(
      _value.copyWith(
            username:
                null == username
                    ? _value.username
                    : username // ignore: cast_nullable_to_non_nullable
                        as String,
            email:
                null == email
                    ? _value.email
                    : email // ignore: cast_nullable_to_non_nullable
                        as String,
            password:
                null == password
                    ? _value.password
                    : password // ignore: cast_nullable_to_non_nullable
                        as String,
            bio:
                freezed == bio
                    ? _value.bio
                    : bio // ignore: cast_nullable_to_non_nullable
                        as String?,
            userType:
                null == userType
                    ? _value.userType
                    : userType // ignore: cast_nullable_to_non_nullable
                        as UserType,
            mentorshipStatus:
                freezed == mentorshipStatus
                    ? _value.mentorshipStatus
                    : mentorshipStatus // ignore: cast_nullable_to_non_nullable
                        as MentorshipStatus?,
            maxMenteeCount:
                freezed == maxMenteeCount
                    ? _value.maxMenteeCount
                    : maxMenteeCount // ignore: cast_nullable_to_non_nullable
                        as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RegisterRequestDtoImplCopyWith<$Res>
    implements $RegisterRequestDtoCopyWith<$Res> {
  factory _$$RegisterRequestDtoImplCopyWith(
    _$RegisterRequestDtoImpl value,
    $Res Function(_$RegisterRequestDtoImpl) then,
  ) = __$$RegisterRequestDtoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String username,
    String email,
    String password,
    String? bio,
    UserType userType,
    MentorshipStatus? mentorshipStatus,
    int? maxMenteeCount,
  });
}

/// @nodoc
class __$$RegisterRequestDtoImplCopyWithImpl<$Res>
    extends _$RegisterRequestDtoCopyWithImpl<$Res, _$RegisterRequestDtoImpl>
    implements _$$RegisterRequestDtoImplCopyWith<$Res> {
  __$$RegisterRequestDtoImplCopyWithImpl(
    _$RegisterRequestDtoImpl _value,
    $Res Function(_$RegisterRequestDtoImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RegisterRequestDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? username = null,
    Object? email = null,
    Object? password = null,
    Object? bio = freezed,
    Object? userType = null,
    Object? mentorshipStatus = freezed,
    Object? maxMenteeCount = freezed,
  }) {
    return _then(
      _$RegisterRequestDtoImpl(
        username:
            null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                    as String,
        email:
            null == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                    as String,
        password:
            null == password
                ? _value.password
                : password // ignore: cast_nullable_to_non_nullable
                    as String,
        bio:
            freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                    as String?,
        userType:
            null == userType
                ? _value.userType
                : userType // ignore: cast_nullable_to_non_nullable
                    as UserType,
        mentorshipStatus:
            freezed == mentorshipStatus
                ? _value.mentorshipStatus
                : mentorshipStatus // ignore: cast_nullable_to_non_nullable
                    as MentorshipStatus?,
        maxMenteeCount:
            freezed == maxMenteeCount
                ? _value.maxMenteeCount
                : maxMenteeCount // ignore: cast_nullable_to_non_nullable
                    as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RegisterRequestDtoImpl implements _RegisterRequestDto {
  const _$RegisterRequestDtoImpl({
    required this.username,
    required this.email,
    required this.password,
    this.bio,
    required this.userType,
    this.mentorshipStatus,
    this.maxMenteeCount,
  });

  factory _$RegisterRequestDtoImpl.fromJson(Map<String, dynamic> json) =>
      _$$RegisterRequestDtoImplFromJson(json);

  @override
  final String username;
  @override
  final String email;
  @override
  final String password;
  @override
  final String? bio;
  @override
  final UserType userType;
  // Ensure UserType enum is imported
  @override
  final MentorshipStatus? mentorshipStatus;
  @override
  final int? maxMenteeCount;

  @override
  String toString() {
    return 'RegisterRequestDto(username: $username, email: $email, password: $password, bio: $bio, userType: $userType, mentorshipStatus: $mentorshipStatus, maxMenteeCount: $maxMenteeCount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RegisterRequestDtoImpl &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.password, password) ||
                other.password == password) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            (identical(other.userType, userType) ||
                other.userType == userType) &&
            (identical(other.mentorshipStatus, mentorshipStatus) ||
                other.mentorshipStatus == mentorshipStatus) &&
            (identical(other.maxMenteeCount, maxMenteeCount) ||
                other.maxMenteeCount == maxMenteeCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    username,
    email,
    password,
    bio,
    userType,
    mentorshipStatus,
    maxMenteeCount,
  );

  /// Create a copy of RegisterRequestDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RegisterRequestDtoImplCopyWith<_$RegisterRequestDtoImpl> get copyWith =>
      __$$RegisterRequestDtoImplCopyWithImpl<_$RegisterRequestDtoImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$RegisterRequestDtoImplToJson(this);
  }
}

abstract class _RegisterRequestDto implements RegisterRequestDto {
  const factory _RegisterRequestDto({
    required final String username,
    required final String email,
    required final String password,
    final String? bio,
    required final UserType userType,
    final MentorshipStatus? mentorshipStatus,
    final int? maxMenteeCount,
  }) = _$RegisterRequestDtoImpl;

  factory _RegisterRequestDto.fromJson(Map<String, dynamic> json) =
      _$RegisterRequestDtoImpl.fromJson;

  @override
  String get username;
  @override
  String get email;
  @override
  String get password;
  @override
  String? get bio;
  @override
  UserType get userType; // Ensure UserType enum is imported
  @override
  MentorshipStatus? get mentorshipStatus;
  @override
  int? get maxMenteeCount;

  /// Create a copy of RegisterRequestDto
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RegisterRequestDtoImplCopyWith<_$RegisterRequestDtoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
