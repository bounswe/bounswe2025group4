// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AuthResponseDtoImpl _$$AuthResponseDtoImplFromJson(
  Map<String, dynamic> json,
) => _$AuthResponseDtoImpl(
  token: json['token'] as String,
  userId: _readIdAsString(json['id']),
  username: json['username'] as String,
  userType: $enumDecode(_$UserTypeEnumMap, json['role']),
  tokenType: json['type'] as String?,
  email: json['email'] as String?,
);

Map<String, dynamic> _$$AuthResponseDtoImplToJson(
  _$AuthResponseDtoImpl instance,
) => <String, dynamic>{
  'token': instance.token,
  'id': instance.userId,
  'username': instance.username,
  'role': _$UserTypeEnumMap[instance.userType]!,
  'type': instance.tokenType,
  'email': instance.email,
};

const _$UserTypeEnumMap = {
  UserType.ROLE_EMPLOYER: 'ROLE_EMPLOYER',
  UserType.ROLE_JOBSEEKER: 'ROLE_JOBSEEKER',
  UserType.ROLE_ADMIN: 'ROLE_ADMIN',
};
