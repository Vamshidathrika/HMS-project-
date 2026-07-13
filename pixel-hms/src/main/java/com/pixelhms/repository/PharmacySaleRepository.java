package com.pixelhms.repository;

import com.pixelhms.entity.PharmacySale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PharmacySaleRepository extends JpaRepository<PharmacySale, Long> {
    List<PharmacySale> findByUhid(String uhid);
}
