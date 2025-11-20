package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.EmployerRequest;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployerRequestRepository extends JpaRepository<EmployerRequest, Long> {

    boolean existsByWorkplace_IdAndCreatedBy_IdAndStatus(
            Long workplaceId,
            Long createdById,
            EmployerRequestStatus status
    );

    Optional<EmployerRequest> findByIdAndWorkplace_Id(Long id, Long workplaceId);

    Page<EmployerRequest> findByWorkplace_Id(Long workplaceId, Pageable pageable);
    Page<EmployerRequest> findByCreatedBy_Id(Long userId, Pageable pageable);
}