package com.pixelhms.controller;

import com.pixelhms.entity.Patient;
import com.pixelhms.repository.PatientRepository;
import com.pixelhms.service.UHIDGeneratorService;
import com.pixelhms.service.AuditLogService;
import com.pixelhms.service.WhatsAppService;
import com.pixelhms.config.SecurityHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UHIDGeneratorService uhidGenerator;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private SecurityHelper securityHelper;

    /**
     * Endpoint to check database health and test connection.
     */
    @GetMapping("/test-db")
    public ResponseEntity<Map<String, Object>> testDb() {
        Map<String, Object> response = new HashMap<>();
        try {
            long count = patientRepository.count();
            response.put("status", "UP");
            response.put("database", "MySQL");
            response.put("message", "Database connection successful!");
            response.put("patientCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            response.put("message", "Failed to connect to the database.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Register a new patient and generate a unique 15-digit UHID.
     */
    @PostMapping("/register")
    public ResponseEntity<Patient> registerPatient(
            @Valid @RequestBody Patient patient,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        // Always generate a fresh unique UHID on the backend, ignoring any input in the payload
        String generatedUhid = uhidGenerator.generate("AH");
        patient.setUhid(generatedUhid);

        Patient savedPatient = patientRepository.save(patient);

        // Audit Trail Log
        auditLogService.log(principal.getUsername(), principal.getRole(), "PATIENT_REGISTER", "Registered patient: " + savedPatient.getPatientName() + " with UHID: " + savedPatient.getUhid(), finalIp, "SUCCESS");

        // WhatsApp welcome message
        whatsAppService.sendWelcomeMessage(savedPatient);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedPatient);
    }

    /**
     * Get all patients.
     */
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    /**
     * Get a single patient by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a patient by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        return patientRepository.findById(id).map(patient -> {
            patientRepository.delete(patient);
            auditLogService.log(principal.getUsername(), principal.getRole(), "PATIENT_DELETE", "Deleted patient: " + patient.getPatientName() + " (UHID: " + patient.getUhid() + ")", finalIp, "SUCCESS");
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Generate the next unique 15-digit sequential UHID without registering a patient yet.
     */
    @GetMapping("/next-uhid")
    public ResponseEntity<Map<String, String>> getNextUhid() {
        String generatedUhid = uhidGenerator.preview("AH");
        Map<String, String> response = new HashMap<>();
        response.put("uhid", generatedUhid);
        return ResponseEntity.ok(response);
    }

    /**
     * Search patients by Name, Mobile, or UHID.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Patient>> searchPatients(@RequestParam(value = "query", defaultValue = "") String query) {
        List<Patient> patients = patientRepository.searchPatients(query);
        return ResponseEntity.ok(patients);
    }

    /**
     * Modify patient registration details.
     */
    @PutMapping("/modify/{id}")
    public ResponseEntity<?> modifyPatient(
            @PathVariable Long id,
            @Valid @RequestBody Patient patientDetails,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        final String finalUsername = principal.getUsername();
        final String finalRole = principal.getRole();
        final String finalIpAddress = finalIp;

        return patientRepository.findById(id).map(patient -> {
            patient.setPatientName(patientDetails.getPatientName());
            patient.setDateOfBirth(patientDetails.getDateOfBirth());
            patient.setGender(patientDetails.getGender());
            patient.setBloodGroup(patientDetails.getBloodGroup());
            patient.setMobile(patientDetails.getMobile());
            patient.setRelationName(patientDetails.getRelationName());
            patient.setAddressLine1(patientDetails.getAddressLine1());
            
            Patient updated = patientRepository.save(patient);
            
            // Audit Trail Log
            auditLogService.log(finalUsername, finalRole, "PATIENT_MODIFY", "Modified patient: " + updated.getPatientName() + " (UHID: " + updated.getUhid() + ")", finalIpAddress, "SUCCESS");
            
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Handle validation errors cleanly.
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}
