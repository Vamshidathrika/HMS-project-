package com.pixelhms.repository;

import com.pixelhms.entity.IPRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IPRegistrationRepository extends JpaRepository<IPRegistration, Long> {
    List<IPRegistration> findByStatus(String status);
    Optional<IPRegistration> findByIpNumber(String ipNumber);
    List<IPRegistration> findByUhid(String uhid);
    List<IPRegistration> findByPatientUhidOrderByAdmissionDateDesc(String uhid);
    List<IPRegistration> findByAdmittingDoctorIdAndStatus(Long doctorId, String status);
}
