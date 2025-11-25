package org.bounswe.jobboardbackend.forum.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.forum.dto.CreatePostRequest;
import org.bounswe.jobboardbackend.forum.dto.PostResponse;
import org.bounswe.jobboardbackend.forum.service.ForumService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ForumController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for simplicity
class ForumControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ForumService forumService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "testuser")
    void createPost_ShouldReturnCreated() throws Exception {
        CreatePostRequest request = new CreatePostRequest();
        request.setTitle("Test Post");
        request.setContent("Content");

        PostResponse response = PostResponse.builder()
                .id(1L)
                .title("Test Post")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(new User()));
        when(forumService.createPost(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/forum/posts")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Post"));
    }

    @Test
    @WithMockUser
    void getAllPosts_ShouldReturnOk() throws Exception {
        when(forumService.findAllPosts()).thenReturn(List.of(PostResponse.builder().build()));

        mockMvc.perform(get("/api/forum/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser
    void getPostById_ShouldReturnOk() throws Exception {
        PostResponse response = PostResponse.builder()
                .id(1L)
                .build();

        when(forumService.findPostById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/forum/posts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deletePost_ShouldReturnNoContent() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(new User()));

        mockMvc.perform(delete("/api/forum/posts/1")
                .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
