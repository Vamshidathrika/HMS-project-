package com.pixelhms.service;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class OPCSService {

    @Autowired
    private OTBookingRepository otBookingRepository;

    @Autowired
    private SurgeryRecordRepository surgeryRecordRepository;

    @Autowired
    private OPInvestigationRepository opInvestigationRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // --- OT OPERATIONS ---

    @Transactional
    public OTBooking createOTBooking(Long patientId, Long surgeonId, String otRoom, 
                                     LocalDate date, LocalTime time, String surgeryName) {
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor surgeon = doctorRepository.findById(surgeonId)
                .orElseThrow(() -> new RuntimeException("Surgeon not found"));

        OTBooking booking = new OTBooking();
        booking.setPatient(patient);
        booking.setUhid(patient.getUhid());
        booking.setSurgeon(surgeon);
        booking.setOtRoom(otRoom);
        booking.setSurgeryDate(date);
        booking.setSurgeryTime(time);
        booking.setSurgeryName(surgeryName);
        booking.setPreOpCheckCompleted(false);
        booking.setStatus("Scheduled");

        return otBookingRepository.save(booking);
    }

    @Transactional
    public OTBooking completePreOpCheck(Long bookingId, Boolean completed) {
        OTBooking booking = otBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("OT Booking not found"));
        booking.setPreOpCheckCompleted(completed);
        return otBookingRepository.save(booking);
    }

    @Transactional
    public SurgeryRecord recordSurgery(Long bookingId, String assistantSurgeon, String anesthesiaType, 
                                       LocalTime startTime, LocalTime endTime, String complications, 
                                       String postOpNotes, String surgeryNotes) {
        
        OTBooking booking = otBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("OT Booking not found"));

        if ("Completed".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Surgery is already recorded");
        }

        booking.setStatus("Completed");
        otBookingRepository.save(booking);

        SurgeryRecord record = new SurgeryRecord();
        record.setOtBooking(booking);
        record.setAssistantSurgeon(assistantSurgeon);
        record.setAnesthesiaType(anesthesiaType);
        record.setStartTime(startTime);
        record.setEndTime(endTime);
        record.setComplications(complications);
        record.setPostOpNotes(postOpNotes);
        record.setSurgeryNotes(surgeryNotes);

        return surgeryRecordRepository.save(record);
    }

    // --- INVESTIGATION OPERATIONS ---

    @Transactional
    public OPInvestigation orderInvestigation(Long patientId, Long doctorId, String testName, String testCategory) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Ordering Doctor not found"));

        OPInvestigation inv = new OPInvestigation();
        inv.setPatient(patient);
        inv.setUhid(patient.getUhid());
        inv.setOrderingDoctor(doctor);
        inv.setTestName(testName);
        inv.setTestCategory(testCategory);
        inv.setOrderDateTime(LocalDateTime.now());
        inv.setSampleCollected(false);
        inv.setStatus("Ordered");

        return opInvestigationRepository.save(inv);
    }

    @Transactional
    public OPInvestigation collectSample(Long investigationId) {
        OPInvestigation inv = opInvestigationRepository.findById(investigationId)
                .orElseThrow(() -> new RuntimeException("Investigation not found"));
        
        inv.setSampleCollected(true);
        inv.setStatus("SampleCollected");
        return opInvestigationRepository.save(inv);
    }

    @Transactional
    public LabResult recordResult(Long investigationId, String resultValue, String referenceRange, 
                                  String remarks, String labTechnician) {
        
        OPInvestigation inv = opInvestigationRepository.findById(investigationId)
                .orElseThrow(() -> new RuntimeException("Investigation not found"));

        inv.setStatus("ResultEntered");
        opInvestigationRepository.save(inv);

        LabResult result = labResultRepository.findByInvestigationId(investigationId)
                .orElseGet(() -> {
                    LabResult lr = new LabResult();
                    lr.setInvestigation(inv);
                    return lr;
                });

        result.setResultValue(resultValue);
        result.setReferenceRange(referenceRange);
        result.setRemarks(remarks);
        result.setLabTechnician(labTechnician);

        return labResultRepository.save(result);
    }

    @Transactional
    public LabResult verifyResult(Long investigationId, String verifiedBy) {
        OPInvestigation inv = opInvestigationRepository.findById(investigationId)
                .orElseThrow(() -> new RuntimeException("Investigation not found"));

        if (!"ResultEntered".equalsIgnoreCase(inv.getStatus())) {
            throw new RuntimeException("Cannot verify result before it is entered");
        }

        inv.setStatus("Verified");
        opInvestigationRepository.save(inv);

        LabResult result = labResultRepository.findByInvestigationId(investigationId)
                .orElseThrow(() -> new RuntimeException("Lab result details not found"));

        result.setVerifiedBy(verifiedBy);
        result.setVerificationDateTime(LocalDateTime.now());

        return labResultRepository.save(result);
    }
}
