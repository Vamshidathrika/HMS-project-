package com.pixelhms.repository;

import com.pixelhms.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByWardId(Long wardId);
    List<Bed> findByWardIdAndStatus(Long wardId, String status);
    List<Bed> findByStatus(String status);
}
