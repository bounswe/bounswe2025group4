package org.bounswe.backend.user.controller;

import org.bounswe.backend.common.enums.MentorshipStatus;
import org.bounswe.backend.common.enums.UserType;
import org.bounswe.backend.common.exception.EmailAlreadyExistsException;
import org.bounswe.backend.common.exception.InvalidAuthContextException;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.common.exception.UsernameAlreadyExistsException;
import org.bounswe.backend.user.dto.UpdateMentorshipDto;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.bounswe.backend.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private UserController userController;

    private UserDto testUserDto;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Set up test data
        testUserDto = UserDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .userType(UserType.EMPLOYER)
                .mentorshipStatus(MentorshipStatus.MENTOR)
                .build();

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .userType(UserType.EMPLOYER)
                .mentorshipStatus(MentorshipStatus.MENTOR)
                .build();

        // Setup security context mock
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        // Arrange
        List<UserDto> userDtos = Collections.singletonList(testUserDto);
        when(userService.getAllUsers()).thenReturn(userDtos);

        // Act
        ResponseEntity<List<UserDto>> response = userController.getAllUsers();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDtos, response.getBody());
        verify(userService, times(1)).getAllUsers();
    }

    @Test
    void getUserById_ShouldReturnUser_WhenUserExists() {
        // Arrange
        when(userService.getUserById(1L)).thenReturn(testUserDto);

        // Act
        ResponseEntity<UserDto> response = userController.getUserById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testUserDto, response.getBody());
        verify(userService, times(1)).getUserById(1L);
    }

    @Test
    void createUser_ShouldReturnCreatedUser_WhenValidData() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userService.createUser(any(UserDto.class))).thenReturn(testUserDto);

        // Act
        ResponseEntity<UserDto> response = userController.createUser(testUserDto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testUserDto, response.getBody());
        verify(userRepository, times(1)).existsByUsername(testUserDto.getUsername());
        verify(userRepository, times(1)).existsByEmail(testUserDto.getEmail());
        verify(userService, times(1)).createUser(testUserDto);
    }

    @Test
    void createUser_ShouldThrowException_WhenUsernameExists() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // Act & Assert
        assertThrows(UsernameAlreadyExistsException.class, () -> userController.createUser(testUserDto));
        verify(userRepository, times(1)).existsByUsername(testUserDto.getUsername());
        verify(userService, never()).createUser(any(UserDto.class));
    }

    @Test
    void createUser_ShouldThrowException_WhenEmailExists() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThrows(EmailAlreadyExistsException.class, () -> userController.createUser(testUserDto));
        verify(userRepository, times(1)).existsByUsername(testUserDto.getUsername());
        verify(userRepository, times(1)).existsByEmail(testUserDto.getEmail());
        verify(userService, never()).createUser(any(UserDto.class));
    }

    @Test
    void updateUser_ShouldReturnUpdatedUser_WhenValidData() {
        // Arrange
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userService.updateUser(anyLong(), any(UserDto.class))).thenReturn(testUserDto);

        // Act
        ResponseEntity<UserDto> response = userController.updateUser(1L, testUserDto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testUserDto, response.getBody());
        verify(userRepository, times(1)).findByUsername(testUserDto.getUsername());
        verify(userRepository, times(1)).findByEmail(testUserDto.getEmail());
        verify(userService, times(1)).updateUser(1L, testUserDto);
    }

    @Test
    void updateUser_ShouldThrowException_WhenUsernameExistsForDifferentUser() {
        // Arrange
        User existingUser = User.builder().id(2L).username("testuser").build();
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(existingUser));

        // Act & Assert
        assertThrows(UsernameAlreadyExistsException.class, () -> userController.updateUser(1L, testUserDto));
        verify(userRepository, times(1)).findByUsername(testUserDto.getUsername());
        verify(userService, never()).updateUser(anyLong(), any(UserDto.class));
    }

    @Test
    void updateUser_ShouldThrowException_WhenEmailExistsForDifferentUser() {
        // Arrange
        User existingUser = User.builder().id(2L).email("test@example.com").build();
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));

        // Act & Assert
        assertThrows(EmailAlreadyExistsException.class, () -> userController.updateUser(1L, testUserDto));
        verify(userRepository, times(1)).findByUsername(testUserDto.getUsername());
        verify(userRepository, times(1)).findByEmail(testUserDto.getEmail());
        verify(userService, never()).updateUser(anyLong(), any(UserDto.class));
    }

    @Test
    void deleteUser_ShouldReturnNoContent() {
        // Act
        ResponseEntity<Void> response = userController.deleteUser(1L);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(userService, times(1)).deleteUser(1L);
    }

    @Test
    void updateMentorshipStatus_ShouldReturnUpdatedUser_WhenValidData() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UpdateMentorshipDto updateDto = new UpdateMentorshipDto();
        updateDto.mentorshipStatus = MentorshipStatus.MENTOR;

        when(userService.updateMentorshipStatus(anyLong(), any(MentorshipStatus.class))).thenReturn(testUserDto);

        // Act
        ResponseEntity<UserDto> response = userController.updateMentorshipStatus(updateDto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testUserDto, response.getBody());
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(userService, times(1)).updateMentorshipStatus(1L, MentorshipStatus.MENTOR);
    }

    @Test
    void updateMentorshipStatus_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        UpdateMentorshipDto updateDto = new UpdateMentorshipDto();
        updateDto.mentorshipStatus = MentorshipStatus.MENTOR;

        // Act & Assert
        assertThrows(NotFoundException.class, () -> userController.updateMentorshipStatus(updateDto));
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(userService, never()).updateMentorshipStatus(anyLong(), any(MentorshipStatus.class));
    }

    @Test
    void updateMentorshipStatus_ShouldThrowException_WhenAuthenticationFails() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("anonymousUser");

        UpdateMentorshipDto updateDto = new UpdateMentorshipDto();
        updateDto.mentorshipStatus = MentorshipStatus.MENTOR;

        // Act & Assert
        assertThrows(InvalidAuthContextException.class, () -> userController.updateMentorshipStatus(updateDto));
        verify(userRepository, never()).findByUsername(anyString());
    }
}
