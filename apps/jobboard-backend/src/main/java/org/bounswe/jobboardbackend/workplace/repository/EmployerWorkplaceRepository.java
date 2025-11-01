package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.EmployerWorkplace;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployerWorkplaceRepository extends JpaRepository<EmployerWorkplace, Long> {
    // Bir kullanıcının employer olduğu tüm workplaces
    Page<EmployerWorkplace> findByUser_Id(Long userId, Pageable pageable);
    List<EmployerWorkplace> findByUser_Id(Long userId);

    // Bir workplace'in tüm employer kayıtları
    Page<EmployerWorkplace> findByWorkplace_Id(Long workplaceId, Pageable pageable);
    List<EmployerWorkplace> findByWorkplace_Id(Long workplaceId);

    // Yetki/Yinelenme kontrolü
    boolean existsByWorkplace_IdAndUser_Id(Long workplaceId, Long userId);
    boolean existsByWorkplace_IdAndUser_IdAndRole(Long workplaceId, Long userId, EmployerRole role);

    // Sayaç & silme işlemleri
    long countByWorkplace_Id(Long workplaceId);
    void deleteByWorkplace_IdAndUser_Id(Long workplaceId, Long userId);
}