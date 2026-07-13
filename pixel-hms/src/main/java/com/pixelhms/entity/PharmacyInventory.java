package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "pharmacy_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "drug_code", nullable = false, unique = true, length = 30)
    private String drugCode;

    @Column(name = "drug_name", nullable = false, length = 150)
    private String drugName;

    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "purchase_price", nullable = false)
    private Double purchasePrice;
}
