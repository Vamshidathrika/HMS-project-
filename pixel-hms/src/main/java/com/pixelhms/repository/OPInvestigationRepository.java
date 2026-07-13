package com.pixelhms.repository;

import com.pixelhms.entity.OPInvestigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OPInvestigationRepository extends JpaRepository<OPInvestigation, Long> {
    List<OPInvestigation> findByStatus(String status);
    List<OPInvestigation> findByPatientUhidOrderByOrderDateTimeDesc(String uhid);
}
