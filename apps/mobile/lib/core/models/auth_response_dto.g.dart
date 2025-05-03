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
  userType: $enumDecode(_$UserTypeEnumMap, json['userType']),
);

Map<String, dynamic> _$$AuthResponseDtoImplToJson(
  _$AuthResponseDtoImpl instance,
) => <String, dynamic>{
  'token': instance.token,
  'id': instance.userId,
  'username': instance.username,
  'userType': _$UserTypeEnumMap[instance.userType]!,
};

const _$UserTypeEnumMap = {
  UserType.EMPLOYER: 'EMPLOYER',
  UserType.JOB_SEEKER: 'JOB_SEEKER',
  UserType.MENTOR: 'MENTOR',
};
