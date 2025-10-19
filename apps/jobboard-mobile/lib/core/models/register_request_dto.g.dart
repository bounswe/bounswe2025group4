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
  role: $enumDecode(_$UserTypeEnumMap, json['role']),
);

Map<String, dynamic> _$$RegisterRequestDtoImplToJson(
  _$RegisterRequestDtoImpl instance,
) => <String, dynamic>{
  'username': instance.username,
  'email': instance.email,
  'password': instance.password,
  'role': _$UserTypeEnumMap[instance.role]!,
};

const _$UserTypeEnumMap = {
  UserType.ROLE_EMPLOYER: 'ROLE_EMPLOYER',
  UserType.ROLE_JOBSEEKER: 'ROLE_JOBSEEKER',
  UserType.ROLE_ADMIN: 'ROLE_ADMIN',
};
