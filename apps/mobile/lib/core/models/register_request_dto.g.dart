// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_request_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RegisterRequestDtoImpl _$$RegisterRequestDtoImplFromJson(
  Map<String, dynamic> json,
) => _$RegisterRequestDtoImpl(
  username: json['username'] as String,
  email: json['email'] as String,
  password: json['password'] as String,
  bio: json['bio'] as String?,
  userType: $enumDecode(_$UserTypeEnumMap, json['userType']),
);

Map<String, dynamic> _$$RegisterRequestDtoImplToJson(
  _$RegisterRequestDtoImpl instance,
) => <String, dynamic>{
  'username': instance.username,
  'email': instance.email,
  'password': instance.password,
  'bio': instance.bio,
  'userType': _$UserTypeEnumMap[instance.userType]!,
};

const _$UserTypeEnumMap = {
  UserType.EMPLOYER: 'EMPLOYER',
  UserType.JOB_SEEKER: 'JOB_SEEKER',
  UserType.MENTOR: 'MENTOR',
};
