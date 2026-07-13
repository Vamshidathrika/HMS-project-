package com.pixelhms.repository;

import com.pixelhms.entity.PharmacyInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PharmacyInventoryRepository extends JpaRepository<PharmacyInventory, Long> {
    Optional<PharmacyInventory> findByDrugCode(String drugCode);
}
