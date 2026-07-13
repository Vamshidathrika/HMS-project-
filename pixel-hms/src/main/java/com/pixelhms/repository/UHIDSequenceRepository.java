package com.pixelhms.repository;

import com.pixelhms.entity.UHIDSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UHIDSequenceRepository extends JpaRepository<UHIDSequence, String> {
}
