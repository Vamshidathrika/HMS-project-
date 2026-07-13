package com.pixelhms.controller;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import com.pixelhms.service.IPService;
import com.pixelhms.service.AuditLogService;
import com.pixelhms.service.WhatsAppService;
import com.pixelhms.config.SecurityHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ip")
@CrossOrigin(origins = "*")
public class IPController {

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private IPRegistrationRepository ipRegistrationRepository;

    @Autowired
    private DailyNoteRepository dailyNoteRepository;

    @Autowired
    private IPService ipService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private SecurityHelper securityHelper;

    /**
     * Get all active wards.
     */
    @GetMapping("/wards")
    public ResponseEntity<List<Ward>> getWards() {
        return ResponseEntity.ok(wardRepository.findByIsActiveTrue());
    }

    /**
     * Get beds, optionally filtered by wardId.
     */
    @GetMapping("/beds")
    public ResponseEntity<List<Bed>> getBeds(@RequestParam(value = "wardId", required = false) Long wardId) {
        if (wardId != null) {
            return ResponseEntity.ok(bedRepository.findByWardId(wardId));
        }
        return ResponseEntity.ok(bedRepository.findAll());
    }

    /**
     * Get all currently admitted patients.
     */
    @GetMapping("/admissions/active")
    public ResponseEntity<List<IPRegistration>> getActiveAdmissions() {
        return ResponseEntity.ok(ipRegistrationRepository.findByStatus("Admitted"));
    }

    /**
     * Get Inpatient history for a UHID.
     */
    @GetMapping("/admissions/history")
    public ResponseEntity<List<IPRegistration>> getPatientIpHistory(@RequestParam("uhid") String uhid) {
        return ResponseEntity.ok(ipRegistrationRepository.findByPatientUhidOrderByAdmissionDateDesc(uhid));
    }

    /**
     * Get all admissions.
     */
    @GetMapping("/admissions")
    public ResponseEntity<List<IPRegistration>> getAllAdmissions() {
        return ResponseEntity.ok(ipRegistrationRepository.findAll());
    }

    /**
     * Get a single admission by ID.
     */
    @GetMapping("/admissions/{id}")
    public ResponseEntity<IPRegistration> getAdmissionById(@PathVariable Long id) {
        return ipRegistrationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update/modify an admission record by ID.
     */
    @PutMapping("/admissions/{id}")
    public ResponseEntity<IPRegistration> updateAdmission(
            @PathVariable Long id,
            @RequestBody IPRegistration details,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        return ipRegistrationRepository.findById(id).map(reg -> {
            reg.setIpNumber(details.getIpNumber());
            reg.setAdmissionDate(details.getAdmissionDate());
            reg.setAdmissionTime(details.getAdmissionTime());
            reg.setAdmissionType(details.getAdmissionType());
            reg.setBedNumber(details.getBedNumber());
            reg.setRoomType(details.getRoomType());
            reg.setDiagnosisProvisional(details.getDiagnosisProvisional());
            reg.setDischargeDate(details.getDischargeDate());
            reg.setDischargeStatus(details.getDischargeStatus());
            reg.setDischargeNotes(details.getDischargeNotes());
            reg.setDischargeInstructions(details.getDischargeInstructions());
            reg.setTotalBill(details.getTotalBill());
            reg.setAdvancePaid(details.getAdvancePaid());
            reg.setStatus(details.getStatus());
            if (details.getDepartment() != null) {
                reg.setDepartment(details.getDepartment());
            }
            if (details.getAdmittingDoctor() != null) {
                reg.setAdmittingDoctor(details.getAdmittingDoctor());
            }
            if (details.getWard() != null) {
                reg.setWard(details.getWard());
            }
            
            IPRegistration saved = ipRegistrationRepository.save(reg);
            auditLogService.log(principal.getUsername(), principal.getRole(), "IPD_UPDATE", "Updated IP admission ID: " + saved.getId() + " for patient UHID: " + saved.getUhid(), finalIp, "SUCCESS");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete an admission by ID.
     */
    @DeleteMapping("/admissions/{id}")
    public ResponseEntity<Void> deleteAdmission(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        return ipRegistrationRepository.findById(id).map(reg -> {
            ipRegistrationRepository.delete(reg);
            auditLogService.log(principal.getUsername(), principal.getRole(), "IPD_DELETE", "Deleted IP admission ID: " + reg.getId() + " for patient UHID: " + reg.getUhid(), finalIp, "SUCCESS");
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new Inpatient Admission (check-in).
     */
    @PostMapping("/admissions")
    public ResponseEntity<?> admitPatient(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            Long patientId = Long.valueOf(body.get("patientId").toString());
            Long doctorId = Long.valueOf(body.get("doctorId").toString());
            Long wardId = Long.valueOf(body.get("wardId").toString());
            String bedNumber = body.get("bedNumber").toString();
            String roomType = body.get("roomType").toString();
            String admissionType = body.get("admissionType").toString();
            String provisionalDiagnosis = body.getOrDefault("provisionalDiagnosis", "").toString();
            
            BigDecimal advancePaid = BigDecimal.ZERO;
            if (body.get("advancePaid") != null && !body.get("advancePaid").toString().trim().isEmpty()) {
                advancePaid = new BigDecimal(body.get("advancePaid").toString());
            }

            SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
            String finalIp = securityHelper.resolveIpAddress(ipAddress);

            IPRegistration reg = ipService.admitPatient(patientId, doctorId, wardId, bedNumber, 
                                                        roomType, admissionType, provisionalDiagnosis, advancePaid);

            // Audit Trail Log
            auditLogService.log(principal.getUsername(), principal.getRole(), "IPD_ADMIT", "Admitted patient: " + reg.getPatient().getPatientName() + " (UHID: " + reg.getPatient().getUhid() + ") to Ward: " + reg.getWard().getName() + " (Bed: " + reg.getBedNumber() + ")", finalIp, "SUCCESS");

            // WhatsApp Notification
            whatsAppService.sendIPAdmissionMessage(reg.getPatient(), reg.getWard().getName(), reg.getBedNumber());

            return ResponseEntity.status(HttpStatus.CREATED).body(reg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get vital logs and daily progress notes for an admission.
     */
    @GetMapping("/admissions/{id}/notes")
    public ResponseEntity<List<DailyNote>> getDailyNotes(@PathVariable("id") Long ipRegistrationId) {
        return ResponseEntity.ok(dailyNoteRepository.findByIpRegistrationIdOrderByNoteDateTimeDesc(ipRegistrationId));
    }

    /**
     * Add a daily round progress note / vitals update.
     */
    @PostMapping("/admissions/{id}/notes")
    public ResponseEntity<?> addDailyNote(
            @PathVariable("id") Long ipRegistrationId, 
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            Integer pulse = null;
            if (body.get("pulse") != null && !body.get("pulse").toString().trim().isEmpty()) {
                pulse = Integer.valueOf(body.get("pulse").toString());
            }

            String bp = body.getOrDefault("bp", "").toString();

            Double temperature = null;
            if (body.get("temperature") != null && !body.get("temperature").toString().trim().isEmpty()) {
                temperature = Double.valueOf(body.get("temperature").toString());
            }

            Integer spo2 = null;
            if (body.get("spo2") != null && !body.get("spo2").toString().trim().isEmpty()) {
                spo2 = Integer.valueOf(body.get("spo2").toString());
            }

            Integer respiratoryRate = null;
            if (body.get("respiratoryRate") != null && !body.get("respiratoryRate").toString().trim().isEmpty()) {
                respiratoryRate = Integer.valueOf(body.get("respiratoryRate").toString());
            }

            String progressNote = body.getOrDefault("progressNote", "").toString();
            String treatmentNotes = body.getOrDefault("treatmentNotes", "").toString();
            String recordedBy = body.getOrDefault("recordedBy", "Medical Staff").toString();

            SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
            String finalUsername = principal.getUsername();
            String finalRole = "anonymous".equals(finalUsername) ? "Nurse" : principal.getRole();
            String finalIp = securityHelper.resolveIpAddress(ipAddress);

            DailyNote note = ipService.addDailyNote(ipRegistrationId, pulse, bp, temperature, spo2, 
                                                   respiratoryRate, progressNote, treatmentNotes, recordedBy);

            // Audit Trail Log
            auditLogService.log(finalUsername, finalRole, "IPD_DAILY_NOTE", "Recorded vitals & daily progress note for IP admission ID: " + ipRegistrationId + " by: " + recordedBy, finalIp, "SUCCESS");

            return ResponseEntity.status(HttpStatus.CREATED).body(note);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Process checkout/discharge of an admitted patient.
     */
    @PostMapping("/admissions/{id}/discharge")
    public ResponseEntity<?> dischargePatient(
            @PathVariable("id") Long ipRegistrationId, 
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            String dischargeStatus = body.getOrDefault("dischargeStatus", "Discharged").toString();
            String dischargeNotes = body.getOrDefault("dischargeNotes", "").toString();
            String dischargeInstructions = body.getOrDefault("dischargeInstructions", "").toString();
            
            BigDecimal totalBill = BigDecimal.ZERO;
            if (body.get("totalBill") != null && !body.get("totalBill").toString().trim().isEmpty()) {
                totalBill = new BigDecimal(body.get("totalBill").toString());
            }

            SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
            String finalUsername = principal.getUsername();
            String finalRole = "anonymous".equals(finalUsername) ? "Doctor" : principal.getRole();
            String finalIp = securityHelper.resolveIpAddress(ipAddress);

            IPRegistration reg = ipService.dischargePatient(ipRegistrationId, dischargeStatus, 
                                                            dischargeNotes, dischargeInstructions, totalBill);

            // Audit Trail Log
            auditLogService.log(finalUsername, finalRole, "IPD_DISCHARGE", "Discharged inpatient: " + reg.getPatient().getPatientName() + " (UHID: " + reg.getPatient().getUhid() + ") from Ward: " + reg.getWard().getName() + ". Total bill: ₹" + totalBill, finalIp, "SUCCESS");

            return ResponseEntity.ok(reg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
