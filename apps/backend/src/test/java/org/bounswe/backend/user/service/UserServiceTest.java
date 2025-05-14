package org.bounswe.backend.user.service;

import org.bounswe.backend.common.enums.MentorshipStatus;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDto testUserDto;
    private final Long userId = 1L;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = User.builder()
                .id(userId)
                .username("testuser")
                .email("test@example.com")
                .userType(null) // Set appropriate UserType
                .mentorshipStatus(MentorshipStatus.MENTEE)
                .build();

        // Create test user DTO
        testUserDto = UserDto.builder()
                .id(userId)
                .username("testuser")
                .email("test@example.com")
                .userType(null) // Set appropriate UserType
                .mentorshipStatus(MentorshipStatus.MENTEE)
                .build();
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        // Arrange
        when(userRepository.findAll()).thenReturn(Collections.singletonList(testUser));

        // Act
        List<UserDto> result = userService.getAllUsers();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(userId);
        assertThat(result.get(0).getUsername()).isEqualTo("testuser");
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getUserById_WithValidId_ShouldReturnUser() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act
        UserDto result = userService.getUserById(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        assertThat(result.getUsername()).isEqualTo("testuser");
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void getUserById_WithInvalidId_ShouldThrowNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(userRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> userService.getUserById(invalidId));
        verify(userRepository, times(1)).findById(invalidId);
    }

    @Test
    void createUser_ShouldReturnCreatedUser() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserDto result = userService.createUser(testUserDto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        assertThat(result.getUsername()).isEqualTo("testuser");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateUser_WithValidId_ShouldReturnUpdatedUser() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto updatedDto = UserDto.builder()
                .username("updateduser")
                .email("updated@example.com")
                .userType(null) // Set appropriate UserType
                .mentorshipStatus(MentorshipStatus.MENTOR)
                .build();

        // Act
        UserDto result = userService.updateUser(userId, updatedDto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateUser_WithInvalidId_ShouldThrowNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(userRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> userService.updateUser(invalidId, testUserDto));
        verify(userRepository, times(1)).findById(invalidId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateMentorshipStatus_WithValidId_ShouldReturnUpdatedUser() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserDto result = userService.updateMentorshipStatus(userId, MentorshipStatus.MENTOR);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateMentorshipStatus_WithInvalidId_ShouldThrowNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(userRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class,
                () -> userService.updateMentorshipStatus(invalidId, MentorshipStatus.MENTOR));
        verify(userRepository, times(1)).findById(invalidId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_WithValidId_ShouldDeleteUser() {
        // Arrange
        when(userRepository.existsById(userId)).thenReturn(true);
        doNothing().when(userRepository).deleteById(userId);

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(userRepository, times(1)).existsById(userId);
        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void deleteUser_WithInvalidId_ShouldThrowNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(userRepository.existsById(invalidId)).thenReturn(false);

        // Act & Assert
        assertThrows(NotFoundException.class, () -> userService.deleteUser(invalidId));
        verify(userRepository, times(1)).existsById(invalidId);
        verify(userRepository, never()).deleteById(invalidId);
    }
}

