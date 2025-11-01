package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkplaceRepository extends JpaRepository<Workplace, Long> {
    Page<Workplace> findByDeletedFalse(Pageable pageable);

    Page<Workplace> findByDeletedFalseAndSectorIgnoreCase(String sector, Pageable pageable);

    Page<Workplace> findByDeletedFalseAndLocationIgnoreCase(String location, Pageable pageable);

    Page<Workplace> findByDeletedFalseAndCompanyNameContainingIgnoreCase(String companyName, Pageable pageable);
}