package com.pixelhms.repository;

import com.pixelhms.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientUhidOrderByCreatedDateDesc(String uhid);
    Optional<Prescription> findByOpRegistrationId(Long opRegistrationId);
}
