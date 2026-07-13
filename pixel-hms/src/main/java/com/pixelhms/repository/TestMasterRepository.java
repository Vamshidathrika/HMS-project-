package com.pixelhms.repository;

import com.pixelhms.entity.TestMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TestMasterRepository extends JpaRepository<TestMaster, Long> {
    Optional<TestMaster> findByTestCode(String testCode);
}
