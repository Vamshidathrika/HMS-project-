package com.pixelhms.repository;

import com.pixelhms.entity.PatientFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientFollowUpRepository extends JpaRepository<PatientFollowUp, Long> {
    List<PatientFollowUp> findByUhid(String uhid);
}
