package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "patient_followups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientFollowUp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String uhid;

    @Column(name = "patient_name", nullable = false, length = 150)
    private String patientName;

    @Column(name = "doctor_name", nullable = false, length = 150)
    private String doctorName;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(nullable = false, length = 20)
    private String status; // Scheduled, Completed, Cancelled

    @Column(columnDefinition = "TEXT")
    private String notes;
}
