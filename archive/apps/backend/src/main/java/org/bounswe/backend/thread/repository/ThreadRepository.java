package org.bounswe.backend.thread.repository;

import org.bounswe.backend.thread.entity.Thread;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
}
