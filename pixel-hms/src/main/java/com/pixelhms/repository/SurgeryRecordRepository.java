package com.pixelhms.repository;

import com.pixelhms.entity.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SurgeryRecordRepository extends JpaRepository<SurgeryRecord, Long> {
    Optional<SurgeryRecord> findByOtBookingId(Long otBookingId);
}
