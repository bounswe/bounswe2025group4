package org.bounswe.backend.profile.controller;

import org.bounswe.backend.profile.dto.*;
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

    private FullProfileDto mockProfile;

    private AutoCloseable closeable;

    private final Long userId = 1L;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);

        mockUser = User.builder()
                .id(userId)
                .username("john")
                .email("john@example.com")
                .build();


        mockProfile = FullProfileDto.builder()
                .profile(null) // add mock profile info if needed
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



    @Test
    void getMyProfile_success() {
        // Spy the controller to override getCurrentUser()
        ProfileController controller = spy(profileController);

        // Stub getCurrentUser() to return our mock user
        doReturn(mockUser).when(controller).getCurrentUser();

        // Mock the service response
        when(profileService.getProfileByUserId(mockUser.getId())).thenReturn(mockProfile);

        // Act
        ResponseEntity<FullProfileDto> response = controller.getMyProfile();

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockProfile, response.getBody());
        verify(profileService).getProfileByUserId(mockUser.getId());
    }



    @Test
    void updateInterests_success() {
        // Arrange
        Long userId = 1L;
        InterestUpdateRequestDto request = new InterestUpdateRequestDto();
        request.setInterests(List.of("AI", "Backend"));

        ProfileDto expectedProfile = ProfileDto.builder()
                .id(1L)
                .fullName("John Doe")
                .interests(List.of("AI", "Backend"))
                .userId(userId)
                .build();

        when(userRepository.findByUsername(any())).thenReturn(Optional.of(mockUser));
        when(profileService.updateInterests(eq(userId), anyList())).thenReturn(expectedProfile);

        ProfileController controller = spy(profileController);
        doReturn(mockUser).when(controller).getCurrentUser();

        // Act
        ResponseEntity<ProfileDto> response = controller.updateInterests(userId, request);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(expectedProfile, response.getBody());
        verify(profileService).updateInterests(userId, request.getInterests());
    }




    @Test
    void getBadges_shouldReturnListOfBadges() {
        // Arrange
        Long userId = 1L;
        List<BadgeDto> mockBadges = Arrays.asList(
                BadgeDto.builder().id(1L).name("Badge A").build(),
                BadgeDto.builder().id(2L).name("Badge B").build()
        );

        when(profileService.getBadgesByUserId(userId)).thenReturn(mockBadges);

        // Act
        ResponseEntity<List<BadgeDto>> response = profileController.getBadges(userId);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Badge A", response.getBody().get(0).getName());
        verify(profileService, times(1)).getBadgesByUserId(userId);
    }


    @Test
    void deleteEducation_Success() {
        // Arrange
        when(userRepository.findByUsername(any())).thenReturn(Optional.of(mockUser));
        ProfileController controller = spy(profileController);
        doReturn(mockUser).when(controller).getCurrentUser();

        // Act
        Long eduId = 100L;
        ResponseEntity<Void> response = controller.deleteEducation(userId, eduId);

        // Assert
        assertEquals(204, response.getStatusCode().value());
        verify(profileService).deleteEducation(userId, eduId);
    }



    @Test
    void deleteEducation_Forbidden() {
        // Arrange
        User anotherUser = User.builder().id(2L).username("jane").build();
        when(userRepository.findByUsername(any())).thenReturn(Optional.of(anotherUser));
        ProfileController controller = spy(profileController);
        doReturn(anotherUser).when(controller).getCurrentUser();

        // Act
        Long eduId = 100L;
        ResponseEntity<Void> response = controller.deleteEducation(userId, eduId);

        // Assert
        assertEquals(403, response.getStatusCode().value());
        verify(profileService, never()).deleteEducation(any(), any());
    }

    @Test
    void updateExperience_Success() {
        // Arrange
        UpdateExperienceRequestDto requestDto = new UpdateExperienceRequestDto();
        requestDto.setCompany("ExampleCorp");


        Long expId = 10L;
        ExperienceDto expectedResponse = ExperienceDto.builder()
                .id(expId)
                .company("ExampleCorp")
                .build();

        when(userRepository.findByUsername(any())).thenReturn(Optional.of(mockUser));

        ProfileController controller = spy(profileController);
        doReturn(mockUser).when(controller).getCurrentUser();

        when(profileService.updateExperience(userId, expId, requestDto))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<ExperienceDto> response = controller.updateExperience(userId, expId, requestDto);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedResponse, response.getBody());
        verify(profileService).updateExperience(userId, expId, requestDto);
    }



    @Test
    void updateExperience_Forbidden() {
        // Arrange
        User otherUser = User.builder().id(99L).username("hacker").build();
        when(userRepository.findByUsername(any())).thenReturn(Optional.of(otherUser));

        ProfileController controller = spy(profileController);
        doReturn(otherUser).when(controller).getCurrentUser();

        UpdateExperienceRequestDto requestDto = new UpdateExperienceRequestDto();
        Long expId = 10L;

        // Act
        ResponseEntity<ExperienceDto> response = controller.updateExperience(userId, expId, requestDto);

        // Assert
        assertEquals(403, response.getStatusCode().value());
        verify(profileService, never()).updateExperience(any(), any(), any());
    }
}
