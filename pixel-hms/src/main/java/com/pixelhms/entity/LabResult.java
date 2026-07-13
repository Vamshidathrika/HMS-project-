package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "investigation_id", nullable = false)
    private OPInvestigation investigation;

    @Column(name = "result_value", nullable = false, length = 100)
    private String resultValue;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "lab_technician", length = 100)
    private String labTechnician;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verification_date_time")
    private LocalDateTime verificationDateTime;
}
