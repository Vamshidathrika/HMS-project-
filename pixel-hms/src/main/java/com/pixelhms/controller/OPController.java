package com.pixelhms.controller;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import com.pixelhms.service.OPService;
import com.pixelhms.service.AuditLogService;
import com.pixelhms.service.WhatsAppService;
import com.pixelhms.config.SecurityHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/op")
@CrossOrigin(origins = "*")
public class OPController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private OPRegistrationRepository registrationRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private OPService opService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private SecurityHelper securityHelper;

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findByIsActiveTrue());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/registrations")
    public ResponseEntity<List<OPRegistration>> getRegistrationsByDate(
            @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(registrationRepository.findByVisitDateBetween(fromDate, toDate));
    }

    /**
     * Get a single OP registration by ID.
     */
    @GetMapping("/registrations/{id}")
    public ResponseEntity<OPRegistration> getRegistrationById(@PathVariable Long id) {
        return registrationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete an OP registration by ID.
     */
    @DeleteMapping("/registrations/{id}")
    public ResponseEntity<Void> deleteRegistration(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        return registrationRepository.findById(id).map(reg -> {
            registrationRepository.delete(reg);
            auditLogService.log(principal.getUsername(), principal.getRole(), "OPD_DELETE", "Deleted OP registration ID: " + reg.getId() + " for patient UHID: " + reg.getUhid(), finalIp, "SUCCESS");
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/registrations")
    public ResponseEntity<?> registerVisit(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            Long patientId = Long.valueOf(body.get("patientId").toString());
            Long doctorId = Long.valueOf(body.get("doctorId").toString());
            String chiefComplaint = body.getOrDefault("chiefComplaint", "").toString();
            String visitType = body.getOrDefault("visitType", "New").toString();
            String paymentStatus = body.getOrDefault("paymentStatus", "Pending").toString();

            String referringDoctor = body.getOrDefault("referringDoctor", "SELF").toString();
            String patientCategory = body.getOrDefault("patientCategory", "General").toString();
            Double consultingFee = body.get("consultingFee") != null ? Double.valueOf(body.get("consultingFee").toString()) : 0.0;
            String paymentMode = body.getOrDefault("paymentMode", "Cash").toString();
            Integer ageValue = body.get("ageValue") != null ? Integer.valueOf(body.get("ageValue").toString()) : 35;
            String ageUnit = body.getOrDefault("ageUnit", "Yrs").toString();

            String tempF = body.getOrDefault("tempF", "").toString();
            String pulseRate = body.getOrDefault("pulseRate", "").toString();
            String respiratoryRate = body.getOrDefault("respiratoryRate", "").toString();
            String spo2 = body.getOrDefault("spo2", "").toString();
            String bloodPressure = body.getOrDefault("bloodPressure", "").toString();
            String weight = body.getOrDefault("weight", "").toString();
            String height = body.getOrDefault("height", "").toString();
            String remarks = body.getOrDefault("remarks", "").toString();

            SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
            String finalIp = securityHelper.resolveIpAddress(ipAddress);

            OPRegistration reg = opService.registerVisit(
                    patientId, doctorId, chiefComplaint, visitType, paymentStatus,
                    referringDoctor, patientCategory, consultingFee, paymentMode, ageValue, ageUnit,
                    tempF, pulseRate, respiratoryRate, spo2, bloodPressure, weight, height, remarks
            );

            // Audit Trail Log
            auditLogService.log(principal.getUsername(), principal.getRole(), "OPD_REGISTER", "Booked OP visit for patient: " + reg.getPatient().getPatientName() + " (UHID: " + reg.getPatient().getUhid() + ") with Doctor: " + reg.getAssignedDoctor().getName(), finalIp, "SUCCESS");

            // WhatsApp Notification
            whatsAppService.sendOPRegistrationMessage(reg.getPatient(), reg.getAssignedDoctor().getName(), String.valueOf(reg.getTokenNumber()));

            return ResponseEntity.status(HttpStatus.CREATED).body(reg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/doctor-wise")
    public ResponseEntity<List<OPRegistration>> getDoctorQueue(
            @RequestParam("doctorId") Long doctorId,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        List<OPRegistration> queue = registrationRepository.findByAssignedDoctorIdAndVisitDateOrderByTokenNumberAsc(doctorId, date);
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/consultations")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> saveConsultation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            Long opRegistrationId = Long.valueOf(body.get("opRegistrationId").toString());
            String symptoms = body.getOrDefault("symptoms", "").toString();
            String diagnosis = body.getOrDefault("diagnosis", "").toString();
            String notes = body.getOrDefault("notes", "").toString();

            SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
            String finalUsername = principal.getUsername();
            String finalRole = "anonymous".equals(finalUsername) ? "Doctor" : principal.getRole();
            String finalIp = securityHelper.resolveIpAddress(ipAddress);
            
            List<Map<String, String>> medicinesList = (List<Map<String, String>>) body.get("medicines");
            List<PrescriptionMedicine> medicines = new ArrayList<>();
            if (medicinesList != null) {
                for (Map<String, String> m : medicinesList) {
                    medicines.add(new PrescriptionMedicine(
                            m.get("medicineName"),
                            m.get("dosage"),
                            m.get("frequency"),
                            m.get("duration"),
                            m.get("instruction")
                    ));
                }
            }

            Prescription prescription = opService.saveConsultation(opRegistrationId, symptoms, diagnosis, notes, medicines);

            // Audit Trail Log
            auditLogService.log(finalUsername, finalRole, "OPD_CONSULTATION", "Saved Doctor Consultation for patient: " + prescription.getPatient().getPatientName() + " (UHID: " + prescription.getPatient().getUhid() + "). Diagnosis: " + diagnosis, finalIp, "SUCCESS");

            return ResponseEntity.ok(prescription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Prescription>> getPatientHistory(@RequestParam("uhid") String uhid) {
        List<Prescription> history = prescriptionRepository.findByPatientUhidOrderByCreatedDateDesc(uhid);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/registrations/patient")
    public ResponseEntity<List<OPRegistration>> getPatientRegistrations(@RequestParam("uhid") String uhid) {
        return ResponseEntity.ok(registrationRepository.findByUhidOrderByVisitDateDescVisitTimeDesc(uhid));
    }

    @PutMapping("/registrations/modify/{id}")
    public ResponseEntity<?> modifyVisit(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            Long doctorId = Long.valueOf(body.get("doctorId").toString());
            String chiefComplaint = body.getOrDefault("chiefComplaint", "").toString();
            String visitType = body.getOrDefault("visitType", "New").toString();
            String paymentStatus = body.getOrDefault("paymentStatus", "Pending").toString();

            String referringDoctor = body.getOrDefault("referringDoctor", "SELF").toString();
            String patientCategory = body.getOrDefault("patientCategory", "General").toString();
            Double consultingFee = body.get("consultingFee") != null ? Double.valueOf(body.get("consultingFee").toString()) : 0.0;
            String paymentMode = body.getOrDefault("paymentMode", "Cash").toString();
            Integer ageValue = body.get("ageValue") != null ? Integer.valueOf(body.get("ageValue").toString()) : 35;
            String ageUnit = body.getOrDefault("ageUnit", "Yrs").toString();

            String tempF = body.getOrDefault("tempF", "").toString();
            String pulseRate = body.getOrDefault("pulseRate", "").toString();
            String respiratoryRate = body.getOrDefault("respiratoryRate", "").toString();
            String spo2 = body.getOrDefault("spo2", "").toString();
            String bloodPressure = body.getOrDefault("bloodPressure", "").toString();
            String weight = body.getOrDefault("weight", "").toString();
            String height = body.getOrDefault("height", "").toString();
            String remarks = body.getOrDefault("remarks", "").toString();

            SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
            String finalIp = securityHelper.resolveIpAddress(ipAddress);

            OPRegistration reg = opService.modifyVisit(
                    id, doctorId, chiefComplaint, visitType, paymentStatus,
                    referringDoctor, patientCategory, consultingFee, paymentMode, ageValue, ageUnit,
                    tempF, pulseRate, respiratoryRate, spo2, bloodPressure, weight, height, remarks
            );

            // Audit Trail Log
            auditLogService.log(principal.getUsername(), principal.getRole(), "OPD_MODIFY", "Modified OP visit registry ID: " + reg.getId() + " for patient: " + reg.getPatient().getPatientName(), finalIp, "SUCCESS");

            return ResponseEntity.ok(reg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
