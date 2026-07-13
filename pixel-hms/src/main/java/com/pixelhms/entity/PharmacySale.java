package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "pharmacy_sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PharmacySale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(length = 20)
    private String uhid;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "net_payable", nullable = false)
    private Double netPayable;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus; // Paid, Pending

    @Column(name = "payment_mode", length = 30)
    private String paymentMode; // Cash, Card, UPI
}
