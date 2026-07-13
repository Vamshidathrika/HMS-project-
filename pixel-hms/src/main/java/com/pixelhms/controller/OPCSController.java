package com.pixelhms.controller;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import com.pixelhms.service.OPCSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class OPCSController {

    @Autowired
    private OTBookingRepository otBookingRepository;

    @Autowired
    private SurgeryRecordRepository surgeryRecordRepository;

    @Autowired
    private OPInvestigationRepository opInvestigationRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private OPCSService opcsService;

    // --- OT BOOKING ENDPOINTS ---

    @GetMapping("/opcs/bookings")
    public ResponseEntity<List<OTBooking>> getOTBookings() {
        return ResponseEntity.ok(otBookingRepository.findAll());
    }

    @GetMapping("/opcs/bookings/{id}/record")
    public ResponseEntity<SurgeryRecord> getSurgeryRecord(@PathVariable("id") Long bookingId) {
        return ResponseEntity.ok(surgeryRecordRepository.findByOtBookingId(bookingId).orElse(null));
    }

    @PostMapping("/opcs/bookings")
    public ResponseEntity<?> createOTBooking(@RequestBody Map<String, Object> body) {
        try {
            Long patientId = Long.valueOf(body.get("patientId").toString());
            Long surgeonId = Long.valueOf(body.get("surgeonId").toString());
            String otRoom = body.get("otRoom").toString();
            LocalDate date = LocalDate.parse(body.get("surgeryDate").toString());
            LocalTime time = LocalTime.parse(body.get("surgeryTime").toString());
            String surgeryName = body.get("surgeryName").toString();

            OTBooking booking = opcsService.createOTBooking(patientId, surgeonId, otRoom, date, time, surgeryName);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/opcs/bookings/{id}/pre-op")
    public ResponseEntity<?> completePreOpCheck(@PathVariable("id") Long bookingId, @RequestBody Map<String, Object> body) {
        try {
            Boolean completed = Boolean.valueOf(body.getOrDefault("completed", "true").toString());
            OTBooking booking = opcsService.completePreOpCheck(bookingId, completed);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/opcs/bookings/{id}/record")
    public ResponseEntity<?> recordSurgery(@PathVariable("id") Long bookingId, @RequestBody Map<String, Object> body) {
        try {
            String assistantSurgeon = body.getOrDefault("assistantSurgeon", "").toString();
            String anesthesiaType = body.getOrDefault("anesthesiaType", "General").toString();
            LocalTime startTime = LocalTime.parse(body.get("startTime").toString());
            LocalTime endTime = LocalTime.parse(body.get("endTime").toString());
            String complications = body.getOrDefault("complications", "").toString();
            String postOpNotes = body.getOrDefault("postOpNotes", "").toString();
            String surgeryNotes = body.getOrDefault("surgeryNotes", "").toString();

            SurgeryRecord record = opcsService.recordSurgery(bookingId, assistantSurgeon, anesthesiaType, 
                                                            startTime, endTime, complications, postOpNotes, surgeryNotes);
            return ResponseEntity.status(HttpStatus.CREATED).body(record);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- INVESTIGATION ENDPOINTS ---

    @GetMapping("/investigations/active")
    public ResponseEntity<List<OPInvestigation>> getActiveInvestigations() {
        return ResponseEntity.ok(opInvestigationRepository.findByStatus("Ordered"));
    }

    @GetMapping("/investigations/history")
    public ResponseEntity<List<OPInvestigation>> getPatientInvestigations(@RequestParam("uhid") String uhid) {
        return ResponseEntity.ok(opInvestigationRepository.findByPatientUhidOrderByOrderDateTimeDesc(uhid));
    }

    @GetMapping("/investigations/{id}/result")
    public ResponseEntity<LabResult> getLabResult(@PathVariable("id") Long investigationId) {
        return ResponseEntity.ok(labResultRepository.findByInvestigationId(investigationId).orElse(null));
    }

    @PostMapping("/investigations/order")
    public ResponseEntity<?> orderInvestigation(@RequestBody Map<String, Object> body) {
        try {
            Long patientId = Long.valueOf(body.get("patientId").toString());
            Long doctorId = Long.valueOf(body.get("doctorId").toString());
            String testName = body.get("testName").toString();
            String testCategory = body.get("testCategory").toString();

            OPInvestigation inv = opcsService.orderInvestigation(patientId, doctorId, testName, testCategory);
            return ResponseEntity.status(HttpStatus.CREATED).body(inv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/investigations/{id}/collect")
    public ResponseEntity<?> collectSample(@PathVariable("id") Long investigationId) {
        try {
            OPInvestigation inv = opcsService.collectSample(investigationId);
            return ResponseEntity.ok(inv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/investigations/{id}/results")
    public ResponseEntity<?> recordResult(@PathVariable("id") Long investigationId, @RequestBody Map<String, Object> body) {
        try {
            String resultValue = body.get("resultValue").toString();
            String referenceRange = body.getOrDefault("referenceRange", "").toString();
            String remarks = body.getOrDefault("remarks", "").toString();
            String labTechnician = body.getOrDefault("labTechnician", "Lab Staff").toString();

            LabResult result = opcsService.recordResult(investigationId, resultValue, referenceRange, remarks, labTechnician);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/investigations/{id}/verify")
    public ResponseEntity<?> verifyResult(@PathVariable("id") Long investigationId, @RequestBody Map<String, Object> body) {
        try {
            String verifiedBy = body.getOrDefault("verifiedBy", "Pathologist").toString();
            LabResult result = opcsService.verifyResult(investigationId, verifiedBy);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/investigations/{id}")
    @Transactional
    public ResponseEntity<?> deleteInvestigation(@PathVariable("id") Long id) {
        try {
            labResultRepository.findByInvestigationId(id).ifPresent(lr -> labResultRepository.delete(lr));
            opInvestigationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Investigation deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
