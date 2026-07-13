package com.pixelhms.service;

import com.pixelhms.entity.AuditLog;
import com.pixelhms.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String username, String role, String action, String details, String ipAddress, String status) {
        AuditLog log = new AuditLog();
        log.setTimestamp(LocalDateTime.now());
        log.setUsername(username != null ? username : "anonymous");
        log.setRole(role != null ? role : "Guest");
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
        log.setStatus(status);
        auditLogRepository.save(log);
    }
}
