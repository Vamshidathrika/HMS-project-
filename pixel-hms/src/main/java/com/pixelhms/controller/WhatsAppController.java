package com.pixelhms.controller;

import com.pixelhms.entity.Patient;
import com.pixelhms.entity.WhatsAppLog;
import com.pixelhms.entity.WhatsAppTemplate;
import com.pixelhms.repository.PatientRepository;
import com.pixelhms.repository.WhatsAppLogRepository;
import com.pixelhms.repository.WhatsAppTemplateRepository;
import com.pixelhms.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/whatsapp")
@CrossOrigin(origins = "*")
public class WhatsAppController {

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private WhatsAppLogRepository whatsAppLogRepository;

    @Autowired
    private WhatsAppTemplateRepository whatsAppTemplateRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/send-welcome")
    public ResponseEntity<?> sendWelcomeMessage(@RequestParam("patientId") Long patientId) {
        return patientRepository.findById(patientId).map(patient -> {
            whatsAppService.sendWelcomeMessage(patient);
            return ResponseEntity.ok().body(Map.of("message", "Welcome message sent successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        String detailedStatus = whatsAppService.getDetailedStatus();
        return ResponseEntity.ok().header("Content-Type", "application/json").body(detailedStatus);
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connect() {
        String res = whatsAppService.triggerConnect();
        return ResponseEntity.ok().header("Content-Type", "application/json").body(res);
    }

    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnect() {
        String res = whatsAppService.triggerDisconnect();
        return ResponseEntity.ok().header("Content-Type", "application/json").body(res);
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendCustomMessage(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        String text = payload.get("text");
        String uhid = payload.get("uhid");
        String name = payload.get("name");
        
        boolean sent = whatsAppService.sendMessage(phone, text);
        
        // Log custom message in the database outbox logs
        WhatsAppLog log = new WhatsAppLog();
        log.setTimestamp(java.time.LocalDateTime.now());
        log.setUhid(uhid != null ? uhid : "Chat");
        log.setPatientName(name != null ? name : "Walk-in");
        log.setMobile(phone);
        log.setMessageText(text);
        log.setTemplateName("Custom Chat");
        log.setStatus(sent ? "Sent" : "Failed");
        if (!sent) {
            log.setErrorMessage("WhatsApp client disconnected or Node server unreachable.");
        }
        whatsAppLogRepository.save(log);
        
        if (sent) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Message sent successfully."));
        } else {
            return ResponseEntity.status(503).body(Map.of("success", false, "error", "WhatsApp client is not connected"));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<List<WhatsAppLog>> getLogs() {
        return ResponseEntity.ok(whatsAppLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/templates")
    public ResponseEntity<List<WhatsAppTemplate>> getTemplates() {
        return ResponseEntity.ok(whatsAppTemplateRepository.findAll());
    }

    @PostMapping("/templates")
    public ResponseEntity<?> saveTemplate(@RequestBody WhatsAppTemplate template) {
        return whatsAppTemplateRepository.findByName(template.getName()).map(existing -> {
            existing.setTemplateText(template.getTemplateText());
            existing.setActive(template.isActive());
            whatsAppTemplateRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElseGet(() -> {
            WhatsAppTemplate saved = whatsAppTemplateRepository.save(template);
            return ResponseEntity.ok(saved);
        });
    }
}
