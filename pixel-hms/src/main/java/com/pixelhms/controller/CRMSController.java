package com.pixelhms.controller;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/crms")
@CrossOrigin(origins = "*")
public class CRMSController {

    @Autowired
    private PatientFollowUpRepository patientFollowUpRepository;

    @Autowired
    private PatientFeedbackRepository patientFeedbackRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private WhatsAppLogRepository whatsappLogRepository;

    // --- PATIENT FOLLOW-UPS ---
    @GetMapping("/followups")
    public ResponseEntity<List<PatientFollowUp>> getFollowUps() {
        return ResponseEntity.ok(patientFollowUpRepository.findAll());
    }

    @PostMapping("/followups")
    public ResponseEntity<PatientFollowUp> createFollowUp(@RequestBody PatientFollowUp followUp) {
        if (followUp.getStatus() == null) {
            followUp.setStatus("Scheduled");
        }
        return ResponseEntity.ok(patientFollowUpRepository.save(followUp));
    }

    @PutMapping("/followups/{id}")
    public ResponseEntity<PatientFollowUp> updateFollowUp(@PathVariable Long id, @RequestBody PatientFollowUp followUp) {
        PatientFollowUp existing = patientFollowUpRepository.findById(id).orElseThrow(() -> new RuntimeException("FollowUp not found"));
        existing.setUhid(followUp.getUhid());
        existing.setPatientName(followUp.getPatientName());
        existing.setDoctorName(followUp.getDoctorName());
        existing.setScheduledDate(followUp.getScheduledDate());
        existing.setStatus(followUp.getStatus());
        existing.setNotes(followUp.getNotes());
        return ResponseEntity.ok(patientFollowUpRepository.save(existing));
    }

    @DeleteMapping("/followups/{id}")
    public ResponseEntity<Void> deleteFollowUp(@PathVariable Long id) {
        patientFollowUpRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- PATIENT FEEDBACKS ---
    @GetMapping("/feedbacks")
    public ResponseEntity<List<PatientFeedback>> getFeedbacks() {
        return ResponseEntity.ok(patientFeedbackRepository.findAll());
    }

    @PostMapping("/feedbacks")
    public ResponseEntity<PatientFeedback> createFeedback(@RequestBody PatientFeedback feedback) {
        return ResponseEntity.ok(patientFeedbackRepository.save(feedback));
    }

    // --- CAMPAIGNS ---
    @GetMapping("/campaigns")
    public ResponseEntity<List<Campaign>> getCampaigns() {
        return ResponseEntity.ok(campaignRepository.findAll());
    }

    @PostMapping("/campaigns")
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        if (campaign.getStatus() == null) {
            campaign.setStatus("Draft");
        }
        return ResponseEntity.ok(campaignRepository.save(campaign));
    }

    @PostMapping("/campaigns/{id}/send")
    public ResponseEntity<Campaign> sendCampaign(@PathVariable Long id) {
        Campaign campaign = campaignRepository.findById(id).orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setStatus("Sent");
        campaign.setLaunchDate(LocalDateTime.now());
        Campaign saved = campaignRepository.save(campaign);

        // Simulate sending notifications to target patients
        List<Patient> patients = patientRepository.findAll();
        for (Patient p : patients) {
            // In a real system we would filter by targetGroup. Here, we'll log WhatsApp notifications for matching patients.
            WhatsAppLog log = new WhatsAppLog();
            log.setTimestamp(LocalDateTime.now());
            log.setUhid(p.getUhid());
            log.setPatientName(p.getPatientName());
            log.setMobile(p.getMobile());
            log.setMessageText(campaign.getMessageText());
            log.setTemplateName("Campaign: " + campaign.getTitle());
            log.setStatus("Sent");
            whatsappLogRepository.save(log);
        }

        return ResponseEntity.ok(saved);
    }
}
