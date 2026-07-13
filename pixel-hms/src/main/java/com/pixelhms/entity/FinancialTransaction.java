package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "financial_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tx_date", nullable = false)
    private LocalDate txDate;

    @Column(name = "tx_time", nullable = false)
    private LocalTime txTime;

    @Column(name = "patient_name", length = 150)
    private String patientName;

    @Column(length = 20)
    private String uhid;

    @Column(nullable = false, length = 50)
    private String category; // OPD Consultation, IPD Billing, Diagnostics, Pharmacy Sale, TPA Advance

    @Column(name = "tx_type", nullable = false, length = 20)
    private String txType; // Credit, Debit

    @Column(nullable = false)
    private Double amount;

    @Column(name = "payment_mode", nullable = false, length = 30)
    private String paymentMode; // Cash, Card, UPI, TPA

    @Column(name = "reference_id", length = 50)
    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
