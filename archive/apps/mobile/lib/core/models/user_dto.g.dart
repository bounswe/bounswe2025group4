// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserDtoImpl _$$UserDtoImplFromJson(Map<String, dynamic> json) =>
    _$UserDtoImpl(
      id: (json['id'] as num).toInt(),
      username: json['username'] as String,
      email: json['email'] as String,
      bio: json['bio'] as String?,
      userType: $enumDecode(_$UserTypeEnumMap, json['userType']),
    );

Map<String, dynamic> _$$UserDtoImplToJson(_$UserDtoImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'email': instance.email,
      'bio': instance.bio,
      'userType': _$UserTypeEnumMap[instance.userType]!,
    };

const _$UserTypeEnumMap = {
  UserType.EMPLOYER: 'EMPLOYER',
  UserType.JOB_SEEKER: 'JOB_SEEKER',
  UserType.MENTOR: 'MENTOR',
};
