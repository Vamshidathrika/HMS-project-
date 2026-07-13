package com.pixelhms.repository;

import com.pixelhms.entity.DailyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DailyNoteRepository extends JpaRepository<DailyNote, Long> {
    List<DailyNote> findByIpRegistrationIdOrderByNoteDateTimeDesc(Long ipRegistrationId);
}
