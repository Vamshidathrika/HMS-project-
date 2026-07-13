package com.pixelhms.repository;

import com.pixelhms.entity.TPACompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TPACompanyRepository extends JpaRepository<TPACompany, Long> {
    Optional<TPACompany> findByName(String name);
}
