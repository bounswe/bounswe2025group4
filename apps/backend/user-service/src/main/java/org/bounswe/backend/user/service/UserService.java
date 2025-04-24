package org.bounswe.backend.user.service;

import org.bounswe.backend.user.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    
    List<User> getAllUsers();
    
    Optional<User> getUserById(Long id);
    
    Optional<User> getUserByEmail(String email);
    
    User createUser(User user);
    
    Optional<User> updateUser(Long id, User user);
    
    boolean deleteUser(Long id);
}
