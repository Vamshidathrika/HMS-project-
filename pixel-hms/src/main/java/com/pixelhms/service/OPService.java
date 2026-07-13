package com.pixelhms.service;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class OPService {

    @Autowired
    private OPRegistrationRepository registrationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    /**
     * Registers a new outpatient visit for an existing patient.
     */
    @Transactional
    public OPRegistration registerVisit(
            Long patientId, 
            Long doctorId, 
            String chiefComplaint, 
            String visitType, 
            String paymentStatus,
            String referringDoctor,
            String patientCategory,
            Double consultingFee,
            String paymentMode,
            Integer ageValue,
            String ageUnit,
            String tempF,
            String pulseRate,
            String respiratoryRate,
            String spo2,
            String bloodPressure,
            String weight,
            String height,
            String remarks
    ) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id " + patientId));
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id " + doctorId));
        
        LocalDate today = LocalDate.now();
        
        // Calculate entry number (number of visits for this patient)
        int entryNumber = (int) registrationRepository.countByPatientId(patientId) + 1;
        
        // Calculate token number (number of visits for this doctor today)
        int tokenNumber = (int) registrationRepository.countByAssignedDoctorIdAndVisitDate(doctorId, today) + 1;
        
        OPRegistration reg = new OPRegistration();
        reg.setPatient(patient);
        reg.setUhid(patient.getUhid());
        reg.setEntryNumber(entryNumber);
        reg.setVisitDate(today);
        reg.setVisitTime(LocalTime.now());
        reg.setDepartment(doctor.getDepartment());
        reg.setAssignedDoctor(doctor);
        reg.setChiefComplaint(chiefComplaint);
        reg.setVisitType(visitType);
        reg.setPaymentStatus(paymentStatus);
        reg.setTokenNumber(tokenNumber);
        reg.setStatus("Waiting");
        
        // Additional consultation visit fields
        reg.setReferringDoctor(referringDoctor);
        reg.setPatientCategory(patientCategory);
        reg.setConsultingFee(consultingFee);
        reg.setPaymentMode(paymentMode);
        reg.setAgeValue(ageValue);
        reg.setAgeUnit(ageUnit);
        
        // Vital parameters
        reg.setTempF(tempF);
        reg.setPulseRate(pulseRate);
        reg.setRespiratoryRate(respiratoryRate);
        reg.setSpo2(spo2);
        reg.setBloodPressure(bloodPressure);
        reg.setWeight(weight);
        reg.setHeight(height);
        reg.setRemarks(remarks);
        
        return registrationRepository.save(reg);
    }

    /**
     * Modifies an existing outpatient visit registration.
     */
    @Transactional
    public OPRegistration modifyVisit(
            Long id,
            Long doctorId,
            String chiefComplaint,
            String visitType,
            String paymentStatus,
            String referringDoctor,
            String patientCategory,
            Double consultingFee,
            String paymentMode,
            Integer ageValue,
            String ageUnit,
            String tempF,
            String pulseRate,
            String respiratoryRate,
            String spo2,
            String bloodPressure,
            String weight,
            String height,
            String remarks
    ) {
        OPRegistration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("OP Registration not found with id " + id));
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id " + doctorId));
        
        reg.setAssignedDoctor(doctor);
        reg.setDepartment(doctor.getDepartment());
        reg.setChiefComplaint(chiefComplaint);
        reg.setVisitType(visitType);
        reg.setPaymentStatus(paymentStatus);
        
        reg.setReferringDoctor(referringDoctor);
        reg.setPatientCategory(patientCategory);
        reg.setConsultingFee(consultingFee);
        reg.setPaymentMode(paymentMode);
        reg.setAgeValue(ageValue);
        reg.setAgeUnit(ageUnit);
        
        reg.setTempF(tempF);
        reg.setPulseRate(pulseRate);
        reg.setRespiratoryRate(respiratoryRate);
        reg.setSpo2(spo2);
        reg.setBloodPressure(bloodPressure);
        reg.setWeight(weight);
        reg.setHeight(height);
        reg.setRemarks(remarks);
        
        return registrationRepository.save(reg);
    }

    /**
     * Saves a doctor consultation report and updates visit queue status to Completed.
     */
    @Transactional
    public Prescription saveConsultation(Long opRegistrationId, String symptoms, String diagnosis, String notes, List<PrescriptionMedicine> medicines) {
        OPRegistration reg = registrationRepository.findById(opRegistrationId)
                .orElseThrow(() -> new IllegalArgumentException("OP Registration not found with id " + opRegistrationId));
        
        // Check if prescription already exists for this registration (avoid duplicates)
        Prescription prescription = prescriptionRepository.findByOpRegistrationId(opRegistrationId)
                .orElse(new Prescription());
        
        prescription.setOpRegistration(reg);
        prescription.setPatient(reg.getPatient());
        prescription.setDoctor(reg.getAssignedDoctor());
        prescription.setSymptoms(symptoms);
        prescription.setDiagnosis(diagnosis);
        prescription.setNotes(notes);
        prescription.setMedicines(medicines);
        
        Prescription savedPrescription = prescriptionRepository.saveAndFlush(prescription);
        
        // Update registration status to Completed
        reg.setStatus("Completed");
        registrationRepository.saveAndFlush(reg);
        
        return savedPrescription;
    }
}
