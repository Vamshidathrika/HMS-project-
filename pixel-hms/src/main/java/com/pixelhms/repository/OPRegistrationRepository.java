package com.pixelhms.repository;

import com.pixelhms.entity.OPRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface OPRegistrationRepository extends JpaRepository<OPRegistration, Long> {
    
    // Find all registrations for a doctor on a given day (for consulting queue)
    List<OPRegistration> findByAssignedDoctorIdAndVisitDateOrderByTokenNumberAsc(Long doctorId, LocalDate visitDate);
    
    // Count how many visits booked for a doctor on a given day (for next token number)
    long countByAssignedDoctorIdAndVisitDate(Long doctorId, LocalDate visitDate);
    
    // Count visits of a specific patient (for entry number)
    long countByPatientId(Long patientId);
    
    // Find patient registrations by patient's UHID
    List<OPRegistration> findByUhidOrderByVisitDateDescVisitTimeDesc(String uhid);

    // Find registrations between two visit dates for reporting/reprint
    List<OPRegistration> findByVisitDateBetween(LocalDate fromDate, LocalDate toDate);
}
