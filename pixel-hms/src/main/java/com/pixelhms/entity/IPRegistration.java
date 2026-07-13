package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "ip_registrations", indexes = {
    @Index(name = "idx_ip_uhid", columnList = "uhid"),
    @Index(name = "idx_ip_number", columnList = "ip_number")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IPRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 20)
    private String uhid;

    @Column(name = "ip_number", unique = true, nullable = false, length = 50)
    private String ipNumber;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "admission_time")
    private LocalTime admissionTime;

    @Column(name = "admission_type", length = 50)
    private String admissionType; // Emergency, Elective, Referral, Transfer

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admitting_doctor_id")
    private Doctor admittingDoctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ward_id")
    private Ward ward;

    @Column(name = "bed_number", length = 20)
    private String bedNumber;

    @Column(name = "room_type", length = 50)
    private String roomType; // General, SemiPrivate, Private, Suite, ICU, SICU

    @Column(name = "diagnosis_provisional", columnDefinition = "TEXT")
    private String diagnosisProvisional;

    @Column(name = "discharge_date")
    private LocalDate dischargeDate;

    @Column(name = "discharge_status", length = 50)
    private String dischargeStatus; // Discharged, LAMA, Referred, Deceased, Transfer

    @Column(name = "discharge_notes", columnDefinition = "TEXT")
    private String dischargeNotes;

    @Column(name = "discharge_instructions", columnDefinition = "TEXT")
    private String dischargeInstructions;

    @Column(name = "total_bill", precision = 12, scale = 2)
    private BigDecimal totalBill;

    @Column(name = "advance_paid", precision = 12, scale = 2)
    private BigDecimal advancePaid;

    @Column(nullable = false, length = 30)
    private String status = "Admitted"; // Admitted, Discharged
}
