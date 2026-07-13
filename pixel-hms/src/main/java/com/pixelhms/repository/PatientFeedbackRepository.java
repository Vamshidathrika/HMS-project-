package com.pixelhms.repository;

import com.pixelhms.entity.PatientFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientFeedbackRepository extends JpaRepository<PatientFeedback, Long> {
}
