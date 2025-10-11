package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.profile.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EducationRepository extends JpaRepository<Education, Long> {

    // Bir profilin tüm eğitimleri
    List<Education> findAllByProfileId(Long profileId);

    // Sahiplik kontrolü: education kaydı bu profile mı ait?
    Optional<Education> findByIdAndProfileId(Long educationId, Long profileId);

    // Kullanıcının (User id) tüm eğitimleri — gerektiğinde
    List<Education> findAllByProfileUserId(Long userId);
}