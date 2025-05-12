package org.bounswe.backend.profile.controller;

import org.bounswe.backend.profile.dto.BadgeDto;
import org.bounswe.backend.profile.dto.CreateProfileRequestDto;
import org.bounswe.backend.profile.dto.InterestUpdateRequestDto;
import org.bounswe.backend.profile.dto.ProfileDto;
import org.bounswe.backend.profile.service.ProfileService;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProfileControllerTest {

    @Mock
    private ProfileService profileService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProfileController profileController;

    private User mockUser;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);

        mockUser = User.builder()
                .id(1L)
                .username("john")
                .email("john@example.com")
                .build();
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void createProfile_success() {
        // Arrange
        CreateProfileRequestDto requestDto = new CreateProfileRequestDto();
        requestDto.setFullName("John Doe");
        requestDto.setPhone("123456");
        requestDto.setLocation("Istanbul");

        ProfileDto expectedDto = ProfileDto.builder()
                .id(1L)
                .fullName("John Doe")
                .phone("123456")
                .location("Istanbul")
                .userId(1L)
                .build();

        when(userRepository.findByUsername(any())).thenReturn(java.util.Optional.of(mockUser));
        when(profileService.createProfile(eq(mockUser.getId()), any(CreateProfileRequestDto.class))).thenReturn(expectedDto);

        // Act
        ProfileController controller = spy(profileController);
        doReturn(mockUser).when(controller).getCurrentUser();

        ResponseEntity<ProfileDto> response = controller.createProfile(requestDto);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedDto, response.getBody());
        verify(profileService).createProfile(mockUser.getId(), requestDto);
    }
}
