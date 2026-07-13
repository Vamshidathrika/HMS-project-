package com.pixelhms.repository;

import com.pixelhms.entity.TPAClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TPAClaimRepository extends JpaRepository<TPAClaim, Long> {
    List<TPAClaim> findByUhid(String uhid);
    List<TPAClaim> findByPreAuthStatus(String status);
}
