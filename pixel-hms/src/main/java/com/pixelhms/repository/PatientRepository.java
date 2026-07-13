package com.pixelhms.repository;

import com.pixelhms.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUhid(String uhid);
    
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.uhid) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.mobile LIKE CONCAT('%', :query, '%')")
    List<Patient> searchPatients(@Param("query") String query);
}
