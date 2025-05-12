package org.bounswe.backend.user.service;


import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.bounswe.backend.common.enums.MentorshipStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    public UserDto createUser(UserDto dto) {
        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .bio(dto.getBio())
                .userType(dto.getUserType())
                .mentorshipStatus(dto.getMentorshipStatus())
                .maxMenteeCount(dto.getMaxMenteeCount() != null ? dto.getMaxMenteeCount() : 5)
                .build();
        return toDto(userRepository.save(user));
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setBio(dto.getBio());
        user.setUserType(dto.getUserType());
        if (dto.getMentorshipStatus() != null) {
            user.setMentorshipStatus(dto.getMentorshipStatus());
        }
        if (dto.getMaxMenteeCount() != null) {
            user.setMaxMenteeCount(dto.getMaxMenteeCount());
        }
        return toDto(userRepository.save(user));
    }

    public UserDto updateMentorshipStatus(Long userId, MentorshipStatus mentorshipStatus) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setMentorshipStatus(mentorshipStatus);
        return toDto(userRepository.save(user));
    }

    public UserDto updateMaxMenteeCount(Long userId, Integer maxMenteeCount) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setMaxMenteeCount(maxMenteeCount);
        return toDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .userType(user.getUserType())
                .mentorshipStatus(user.getMentorshipStatus())
                .maxMenteeCount(user.getMaxMenteeCount())
                .build();
    }

}
