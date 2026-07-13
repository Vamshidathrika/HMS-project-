package com.pixelhms.service;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class IPService {

    @Autowired
    private IPRegistrationRepository ipRegistrationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private DailyNoteRepository dailyNoteRepository;

    @Autowired
    private UHIDSequenceRepository sequenceRepository;

    /**
     * Admit a patient into a specific bed within a ward.
     */
    @Transactional
    public IPRegistration admitPatient(Long patientId, Long doctorId, Long wardId, String bedNumber, 
                                       String roomType, String admissionType, String provisionalDiagnosis, 
                                       BigDecimal advancePaid) {
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new RuntimeException("Ward not found"));

        // Check and allocate bed
        List<Bed> beds = bedRepository.findByWardId(wardId);
        Bed targetBed = beds.stream()
                .filter(b -> b.getBedNumber().equalsIgnoreCase(bedNumber))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Bed " + bedNumber + " not found in Ward " + ward.getName()));

        if (!"Available".equalsIgnoreCase(targetBed.getStatus())) {
            throw new RuntimeException("Bed " + bedNumber + " is already " + targetBed.getStatus());
        }

        // Set bed status to Occupied
        targetBed.setStatus("Occupied");
        bedRepository.save(targetBed);

        // Generate IP Number: IP + YYMMDD + 4-digit sequence
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        
        // Fetch or create sequence for IP
        UHIDSequence sequence = sequenceRepository.findById("IP")
                .orElseGet(() -> {
                    UHIDSequence newSeq = new UHIDSequence("IP", 0L);
                    return sequenceRepository.saveAndFlush(newSeq);
                });
        
        long nextVal = sequence.getCurrentSequence() + 1;
        sequence.setCurrentSequence(nextVal);
        sequenceRepository.saveAndFlush(sequence);
        
        String ipNumber = "IP" + datePart + String.format("%04d", nextVal);

        IPRegistration reg = new IPRegistration();
        reg.setPatient(patient);
        reg.setUhid(patient.getUhid());
        reg.setIpNumber(ipNumber);
        reg.setAdmissionDate(LocalDate.now());
        reg.setAdmissionTime(LocalTime.now());
        reg.setAdmissionType(admissionType);
        reg.setDepartment(doctor.getDepartment());
        reg.setAdmittingDoctor(doctor);
        reg.setWard(ward);
        reg.setBedNumber(bedNumber);
        reg.setRoomType(roomType);
        reg.setDiagnosisProvisional(provisionalDiagnosis);
        reg.setAdvancePaid(advancePaid != null ? advancePaid : BigDecimal.ZERO);
        reg.setStatus("Admitted");

        return ipRegistrationRepository.save(reg);
    }

    /**
     * Process patient discharge, billing, and release bed.
     */
    @Transactional
    public IPRegistration dischargePatient(Long ipRegistrationId, String dischargeStatus, 
                                           String dischargeNotes, String dischargeInstructions, 
                                           BigDecimal totalBill) {
        
        IPRegistration reg = ipRegistrationRepository.findById(ipRegistrationId)
                .orElseThrow(() -> new RuntimeException("IP Registration not found"));

        if ("Discharged".equalsIgnoreCase(reg.getStatus())) {
            throw new RuntimeException("Patient is already discharged");
        }

        // Free the allocated bed
        List<Bed> beds = bedRepository.findByWardId(reg.getWard().getId());
        beds.stream()
                .filter(b -> b.getBedNumber().equalsIgnoreCase(reg.getBedNumber()))
                .findFirst()
                .ifPresent(bed -> {
                    bed.setStatus("Available");
                    bedRepository.save(bed);
                });

        reg.setDischargeDate(LocalDate.now());
        reg.setDischargeStatus(dischargeStatus);
        reg.setDischargeNotes(dischargeNotes);
        reg.setDischargeInstructions(dischargeInstructions);
        reg.setTotalBill(totalBill != null ? totalBill : BigDecimal.ZERO);
        reg.setStatus("Discharged");

        return ipRegistrationRepository.save(reg);
    }

    /**
     * Log daily doctor/nursing notes and patient vitals charts.
     */
    @Transactional
    public DailyNote addDailyNote(Long ipRegistrationId, Integer pulse, String bp, 
                                  Double temperature, Integer spo2, Integer respiratoryRate, 
                                  String progressNote, String treatmentNotes, String recordedBy) {
        
        IPRegistration reg = ipRegistrationRepository.findById(ipRegistrationId)
                .orElseThrow(() -> new RuntimeException("IP Registration not found"));

        if (!"Admitted".equalsIgnoreCase(reg.getStatus())) {
            throw new RuntimeException("Patient is no longer admitted");
        }

        DailyNote note = new DailyNote();
        note.setIpRegistration(reg);
        note.setNoteDateTime(LocalDateTime.now());
        note.setPulse(pulse);
        note.setBp(bp);
        note.setTemperature(temperature);
        note.setSpo2(spo2);
        note.setRespiratoryRate(respiratoryRate);
        note.setProgressNote(progressNote);
        note.setTreatmentNotes(treatmentNotes);
        note.setRecordedBy(recordedBy);

        return dailyNoteRepository.save(note);
    }
}
