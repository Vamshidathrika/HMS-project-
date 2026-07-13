package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 20)
    private String uhid;

    @Column(name = "bill_type", nullable = false, length = 20)
    private String billType; // OP, IP

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "advance_adjusted")
    private Double advanceAdjusted;

    @Column(name = "net_payable", nullable = false)
    private Double netPayable;

    @Column(name = "payment_mode", nullable = false, length = 30)
    private String paymentMode; // Cash, Card, UPI, TPA

    @Column(name = "cash_drawer", length = 50)
    private String cashDrawer;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false, length = 20)
    private String status = "Paid"; // Paid, Pending
}
