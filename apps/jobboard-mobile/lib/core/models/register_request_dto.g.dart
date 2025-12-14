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
  role: $enumDecode(_$UserTypeEnumMap, json['role']),
  password: json['password'] as String,
  firstName: json['firstName'] as String,
  lastName: json['lastName'] as String,
  pronounSet: json['pronounSet'] as String,
  bio: json['bio'] as String,
);

Map<String, dynamic> _$$RegisterRequestDtoImplToJson(
  _$RegisterRequestDtoImpl instance,
) => <String, dynamic>{
  'username': instance.username,
  'email': instance.email,
  'role': _$UserTypeEnumMap[instance.role]!,
  'password': instance.password,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'pronounSet': instance.pronounSet,
  'bio': instance.bio,
};

const _$UserTypeEnumMap = {
  UserType.ROLE_EMPLOYER: 'ROLE_EMPLOYER',
  UserType.ROLE_JOBSEEKER: 'ROLE_JOBSEEKER',
  UserType.ROLE_ADMIN: 'ROLE_ADMIN',
};
