package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.workplace.dto.PaginatedResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceDetailResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceRatingResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceUpdateRequest;
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkplaceController.class)
class WorkplaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WorkplaceService workplaceService;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private User employerUser(Long id) {
        return User.builder()
                .id(id)
                .username("emp" + id)
                .email("emp" + id + "@test.com")
                .password("password-" + id)
                .role(Role.ROLE_EMPLOYER)
                .emailVerified(true)
                .build();
    }

    private User jobseekerUser(Long id) {
        return User.builder()
                .id(id)
                .username("js" + id)
                .email("js" + id + "@test.com")
                .password("password-" + id)
                .role(Role.ROLE_JOBSEEKER)
                .emailVerified(true)
                .build();
    }

    private final User EMPLOYER_1 = employerUser(1L);
    private final User EMPLOYER_2 = employerUser(2L);
    private final User JOBSEEKER_1 = jobseekerUser(3L);
    private final User JOBSEEKER_2 = jobseekerUser(4L);

    // ========================================================================
    // CREATE (/api/workplace - POST)
    // ========================================================================

    @Test
    void create_whenPrincipalIsDomainUser_callsServiceWithSameUser() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                EMPLOYER_1,
                null,
                Collections.emptyList()
        );

        WorkplaceCreateRequest req = new WorkplaceCreateRequest();
        req.setCompanyName("Test Company");
        req.setSector("Tech");
        req.setLocation("Istanbul");
        String body = objectMapper.writeValueAsString(req);

        when(workplaceService.create(any(WorkplaceCreateRequest.class), any(User.class)))
                .thenReturn(null);

        mockMvc.perform(post("/api/workplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(workplaceService).create(any(WorkplaceCreateRequest.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(EMPLOYER_1.getId());
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.ROLE_EMPLOYER);
    }

    @Test
    void create_whenPrincipalIsJobseekerDomainUser_callsServiceWithJobseeker() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                JOBSEEKER_1,
                null,
                Collections.emptyList()
        );

        WorkplaceCreateRequest req = new WorkplaceCreateRequest();
        req.setCompanyName("Test Company");
        req.setSector("Tech");
        req.setLocation("Istanbul");
        String body = objectMapper.writeValueAsString(req);

        when(workplaceService.create(any(WorkplaceCreateRequest.class), any(User.class)))
                .thenReturn(null);

        mockMvc.perform(post("/api/workplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(workplaceService).create(any(WorkplaceCreateRequest.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(JOBSEEKER_1.getId());
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.ROLE_JOBSEEKER);
    }

    @Test
    void create_whenUserDetailsPrincipal_resolvesUserFromEmail_andCallsService() throws Exception {
        User domainUser = EMPLOYER_2;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());
        when(workplaceService.create(any(WorkplaceCreateRequest.class), any(User.class)))
                .thenReturn(null);

        WorkplaceCreateRequest req = new WorkplaceCreateRequest();
        req.setCompanyName("Test Company");
        req.setSector("Tech");
        req.setLocation("Istanbul");
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace")
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(workplaceService).create(any(WorkplaceCreateRequest.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void create_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        WorkplaceCreateRequest req = new WorkplaceCreateRequest();
        req.setCompanyName("Test Company");
        req.setSector("Tech");
        req.setLocation("Istanbul");
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace")
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(workplaceService, never()).create(any(), any());
    }

    @Test
    void create_whenPrincipalIsName_resolvesUserFromName() throws Exception {
        User domainUser = EMPLOYER_1;
        String name = domainUser.getEmail();

        when(userRepository.findByEmail(name)).thenReturn(Optional.of(domainUser));
        when(userRepository.findByUsername(name)).thenReturn(Optional.empty());
        when(workplaceService.create(any(WorkplaceCreateRequest.class), any(User.class)))
                .thenReturn(null);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        WorkplaceCreateRequest req = new WorkplaceCreateRequest();
        req.setCompanyName("Test Company");
        req.setSector("Tech");
        req.setLocation("Istanbul");
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(workplaceService).create(any(WorkplaceCreateRequest.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void create_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        WorkplaceCreateRequest req = new WorkplaceCreateRequest();
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(workplaceService, never()).create(any(), any());
    }

    // ========================================================================
    // UPLOAD IMAGE (/api/workplace/{id}/image - POST multipart)
    // ========================================================================

    @Test
    void uploadImage_whenUserDetailsPrincipal_callsServiceWithUserId() throws Exception {
        Long workplaceId = 10L;
        User domainUser = EMPLOYER_1;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());
        when(workplaceService.uploadImage(eq(workplaceId), any(), eq(domainUser.getId())))
                .thenReturn(null);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "logo.png",
                MediaType.IMAGE_PNG_VALUE,
                "dummy".getBytes()
        );

        mockMvc.perform(multipart("/api/workplace/{id}/image", workplaceId)
                        .file(file)
                        .with(user(principalKey))
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(workplaceService).uploadImage(eq(workplaceId), any(), eq(domainUser.getId()));
    }

    @Test
    void uploadImage_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 10L;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "logo.png",
                MediaType.IMAGE_PNG_VALUE,
                "dummy".getBytes()
        );

        mockMvc.perform(multipart("/api/workplace/{id}/image", workplaceId)
                        .file(file))
                .andExpect(status().isForbidden());

        verify(workplaceService, never()).uploadImage(anyLong(), any(), anyLong());
    }

    // ========================================================================
    // DELETE IMAGE (/api/workplace/{id}/image - DELETE)
    // ========================================================================

    @Test
    void deleteImage_whenUserDetailsPrincipal_callsServiceAndReturnsApiMessage() throws Exception {
        Long workplaceId = 20L;
        User domainUser = EMPLOYER_2;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/workplace/{id}/image", workplaceId)
                        .with(user(principalKey))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Workplace image deleted"))
                .andExpect(jsonPath("$.code").value("WORKPLACE_IMAGE_DELETED"));

        verify(workplaceService).deleteImage(workplaceId, domainUser.getId());
    }

    @Test
    void deleteImage_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 20L;

        mockMvc.perform(delete("/api/workplace/{id}/image", workplaceId))
                .andExpect(status().isForbidden());

        verify(workplaceService, never()).deleteImage(anyLong(), anyLong());
    }

    // ========================================================================
    // LIST (/api/workplace - GET)
    // ========================================================================

    @Test
    void list_whenCalledWithParams_delegatesToServiceWithSameValues() throws Exception {
        when(workplaceService.listBrief(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(PaginatedResponse.of(List.of(), 1, 20, 0));

        mockMvc.perform(get("/api/workplace")
                        .with(user("test@test.com"))
                        .param("page", "1")
                        .param("size", "20")
                        .param("sector", "Tech")
                        .param("location", "Istanbul")
                        .param("ethicalTag", "SALARY_TRANSPARENCY")
                        .param("minRating", "3.5")
                        .param("sortBy", "ratingDesc")
                        .param("search", "Ethica"))
                .andExpect(status().isOk());

        verify(workplaceService).listBrief(
                1, 20,
                "Tech",
                "Istanbul",
                "SALARY_TRANSPARENCY",
                3.5,
                "ratingDesc",
                "Ethica"
        );
    }

    @Test
    void list_whenCalledWithoutParams_usesDefaultValues() throws Exception {
        when(workplaceService.listBrief(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(PaginatedResponse.of(List.of(), 0, 12, 0));

        mockMvc.perform(get("/api/workplace")
                        .with(user("test@test.com")))
                .andExpect(status().isOk());

        verify(workplaceService).listBrief(
                0, 12,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    // ========================================================================
    // DETAIL (/api/workplace/{id} - GET)
    // ========================================================================

    @Test
    void detail_whenCalledWithoutParams_usesDefaultIncludeReviewsAndLimit() throws Exception {
        Long workplaceId = 30L;
        when(workplaceService.getDetail(anyLong(), anyBoolean(), anyInt()))
                .thenReturn(new WorkplaceDetailResponse());

        mockMvc.perform(get("/api/workplace/{id}", workplaceId)
                        .with(user("test@test.com")))
                .andExpect(status().isOk());

        verify(workplaceService).getDetail(workplaceId, false, 3);
    }

    @Test
    void detail_whenCalledWithParams_usesProvidedValues() throws Exception {
        Long workplaceId = 30L;
        when(workplaceService.getDetail(anyLong(), anyBoolean(), anyInt()))
                .thenReturn(new WorkplaceDetailResponse());

        mockMvc.perform(get("/api/workplace/{id}", workplaceId)
                        .with(user("test@test.com"))
                        .param("includeReviews", "true")
                        .param("reviewsLimit", "10"))
                .andExpect(status().isOk());

        verify(workplaceService).getDetail(workplaceId, true, 10);
    }

    // ========================================================================
    // UPDATE (/api/workplace/{id} - PUT)
    // ========================================================================

    @Test
    void update_whenPrincipalIsDomainUser_callsServiceWithSameUser() throws Exception {
        Long workplaceId = 40L;
        Authentication auth = new UsernamePasswordAuthenticationToken(
                EMPLOYER_1,
                null,
                Collections.emptyList()
        );

        WorkplaceUpdateRequest req = new WorkplaceUpdateRequest();
        String body = objectMapper.writeValueAsString(req);

        when(workplaceService.update(anyLong(), any(WorkplaceUpdateRequest.class), any(User.class)))
                .thenReturn(new WorkplaceDetailResponse());

        mockMvc.perform(put("/api/workplace/{id}", workplaceId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        verify(workplaceService).update(idCaptor.capture(), any(WorkplaceUpdateRequest.class), userCaptor.capture());
        assertThat(idCaptor.getValue()).isEqualTo(workplaceId);
        assertThat(userCaptor.getValue().getId()).isEqualTo(EMPLOYER_1.getId());
    }

    @Test
    void update_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 40L;

        WorkplaceUpdateRequest req = new WorkplaceUpdateRequest();
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(put("/api/workplace/{id}", workplaceId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(workplaceService, never()).update(anyLong(), any(), any());
    }

    // ========================================================================
    // DELETE WORKPLACE (/api/workplace/{id} - DELETE)
    // ========================================================================

    @Test
    void deleteWorkplace_whenUserDetailsPrincipal_callsServiceAndReturnsApiMessage() throws Exception {
        Long workplaceId = 50L;
        User domainUser = EMPLOYER_2;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/workplace/{id}", workplaceId)
                        .with(user(principalKey))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Workplace deleted"))
                .andExpect(jsonPath("$.code").value("WORKPLACE_DELETED"));

        verify(workplaceService).softDelete(workplaceId, domainUser);
    }

    @Test
    void deleteWorkplace_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 50L;

        mockMvc.perform(delete("/api/workplace/{id}", workplaceId))
                .andExpect(status().isForbidden());

        verify(workplaceService, never()).softDelete(anyLong(), any());
    }

    // ========================================================================
    // GET RATING (/api/workplace/{id}/rating - GET)
    // ========================================================================

    @Test
    void getRating_whenCalled_delegatesToService() throws Exception {
        Long workplaceId = 60L;
        when(workplaceService.getRating(anyLong())).thenReturn(new WorkplaceRatingResponse());

        mockMvc.perform(get("/api/workplace/{id}/rating", workplaceId)
                        .with(user("test@test.com")))
                .andExpect(status().isOk());

        verify(workplaceService).getRating(workplaceId);
    }

}