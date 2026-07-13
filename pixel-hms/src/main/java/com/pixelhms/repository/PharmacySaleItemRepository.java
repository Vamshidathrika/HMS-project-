package com.pixelhms.repository;

import com.pixelhms.entity.PharmacySaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PharmacySaleItemRepository extends JpaRepository<PharmacySaleItem, Long> {
    List<PharmacySaleItem> findByPharmacySaleId(Long pharmacySaleId);
}
