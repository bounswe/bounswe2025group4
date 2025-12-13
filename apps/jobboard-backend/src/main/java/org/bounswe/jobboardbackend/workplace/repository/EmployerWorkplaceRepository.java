package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.EmployerWorkplace;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployerWorkplaceRepository extends JpaRepository<EmployerWorkplace, Long> {
    Page<EmployerWorkplace> findByUser_Id(Long userId, Pageable pageable);

    List<EmployerWorkplace> findByUser_Id(Long userId);

    Page<EmployerWorkplace> findByWorkplace_Id(Long workplaceId, Pageable pageable);

    List<EmployerWorkplace> findByWorkplace_Id(Long workplaceId);

    boolean existsByWorkplace_IdAndUser_Id(Long workplaceId, Long userId);

    boolean existsByWorkplace_IdAndUser_IdAndRole(Long workplaceId, Long userId, EmployerRole role);

    List<EmployerWorkplace> findByUser_IdAndRole(Long userId, EmployerRole role);

    Optional<EmployerWorkplace> findByWorkplace_IdAndRole(Long workplaceId, EmployerRole role);

    long countByWorkplace_Id(Long workplaceId);

    void deleteByWorkplace_IdAndUser_Id(Long workplaceId, Long userId);

    void deleteAllByWorkplace_Id(Long workplaceId);
}