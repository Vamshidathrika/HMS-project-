package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "op_investigations", indexes = {
    @Index(name = "idx_inv_uhid", columnList = "uhid")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OPInvestigation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 20)
    private String uhid;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ordering_doctor_id", nullable = false)
    private Doctor orderingDoctor;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "test_category", nullable = false, length = 50)
    private String testCategory; // Lab, Imaging

    @Column(name = "order_date_time", nullable = false)
    private LocalDateTime orderDateTime;

    @Column(name = "sample_collected")
    private Boolean sampleCollected = false;

    @Column(nullable = false, length = 30)
    private String status = "Ordered"; // Ordered, SampleCollected, ResultEntered, Verified
}
