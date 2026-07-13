package com.pixelhms.repository;

import com.pixelhms.entity.WhatsAppLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WhatsAppLogRepository extends JpaRepository<WhatsAppLog, Long> {
    List<WhatsAppLog> findAllByOrderByTimestampDesc();
}
