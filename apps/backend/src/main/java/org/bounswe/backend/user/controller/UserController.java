package org.bounswe.backend.user.controller;



import org.bounswe.backend.common.exception.InvalidAuthContextException;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.bounswe.backend.user.dto.UpdateMentorshipDto;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.bounswe.backend.user.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mentorship-status")
    public ResponseEntity<UserDto> updateMentorshipStatus(@RequestBody UpdateMentorshipDto request) {
        String username = getCurrentUsername();
        org.bounswe.backend.user.entity.User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User not found"));
        UserDto updated = userService.updateMentorshipStatus(user.getId(), request.mentorshipStatus);
        return ResponseEntity.ok(updated);
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new InvalidAuthContextException();
    }
}

