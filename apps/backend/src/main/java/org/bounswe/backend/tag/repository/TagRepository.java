package org.bounswe.backend.tag.repository;

import org.bounswe.backend.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
}
