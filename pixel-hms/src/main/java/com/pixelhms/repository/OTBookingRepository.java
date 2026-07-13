package com.pixelhms.repository;

import com.pixelhms.entity.OTBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OTBookingRepository extends JpaRepository<OTBooking, Long> {
    List<OTBooking> findByStatus(String status);
    List<OTBooking> findByPatientUhidOrderBySurgeryDateDesc(String uhid);
}
