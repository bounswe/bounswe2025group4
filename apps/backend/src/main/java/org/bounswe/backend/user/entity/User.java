package org.bounswe.backend.user.entity;



import org.bounswe.backend.common.enums.UserType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String email;

    private String bio;

    @Enumerated(EnumType.STRING)
    private UserType userType;
}
