package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "op_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OPRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 20)
    private String uhid;

    @Column(name = "entry_number", nullable = false)
    private Integer entryNumber;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_time")
    private LocalTime visitTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_doctor_id")
    private Doctor assignedDoctor;

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "visit_type", length = 20)
    private String visitType; // New, FollowUp, Emergency, Voluntary

    @Column(name = "payment_status", length = 20)
    private String paymentStatus; // Pending, Paid, Exempted

    @Column(name = "token_number")
    private Integer tokenNumber;

    @Column(length = 20)
    private String status; // Waiting, InConsultation, Completed, Cancelled

    @Column(name = "referring_doctor", length = 100)
    private String referringDoctor;

    @Column(name = "patient_category", length = 50)
    private String patientCategory;

    @Column(name = "consulting_fee")
    private Double consultingFee;

    @Column(name = "payment_mode", length = 20)
    private String paymentMode;

    @Column(name = "age_value")
    private Integer ageValue;

    @Column(name = "age_unit", length = 10)
    private String ageUnit;

    // Vital Parameters
    @Column(name = "temp_f", length = 10)
    private String tempF;

    @Column(name = "pulse_rate", length = 10)
    private String pulseRate;

    @Column(name = "respiratory_rate", length = 10)
    private String respiratoryRate;

    @Column(name = "spo2", length = 10)
    private String spo2;

    @Column(name = "blood_pressure", length = 15)
    private String bloodPressure;

    @Column(name = "weight", length = 10)
    private String weight;

    @Column(name = "height", length = 10)
    private String height;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (this.visitDate == null) {
            this.visitDate = LocalDate.now();
        }
        if (this.visitTime == null) {
            this.visitTime = LocalTime.now();
        }
        if (this.status == null) {
            this.status = "Waiting";
        }
    }
}
