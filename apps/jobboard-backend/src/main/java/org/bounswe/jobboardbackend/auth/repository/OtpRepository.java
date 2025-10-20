package org.bounswe.jobboardbackend.auth.repository;


import org.bounswe.jobboardbackend.auth.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByUsernameAndOtpCode(String username, String otpCode);
    void deleteByUsername(String username);
}