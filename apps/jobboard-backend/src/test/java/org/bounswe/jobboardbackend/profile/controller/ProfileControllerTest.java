package org.bounswe.jobboardbackend.profile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.dto.CreateProfileRequestDto;
import org.bounswe.jobboardbackend.profile.dto.ProfileResponseDto;
import org.bounswe.jobboardbackend.profile.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfileController.class)
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProfileService profileService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @WithMockUser(username = "testuser")
    void createProfile_whenValidRequest_returnsOk() throws Exception {
        CreateProfileRequestDto dto = CreateProfileRequestDto.builder()
                .firstName("John")
                .lastName("Doe")
                .bio("Test bio")
                .build();

        ProfileResponseDto responseDto = ProfileResponseDto.builder()
                .id(1L)
                .userId(1L)
                .firstName("John")
                .lastName("Doe")
                .bio("Test bio")
                .build();

        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(Role.ROLE_JOBSEEKER)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(profileService.createProfile(anyLong(), any(CreateProfileRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/profile")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }
}
