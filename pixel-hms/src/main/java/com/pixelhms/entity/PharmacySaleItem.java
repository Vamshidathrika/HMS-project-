package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pharmacy_sale_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PharmacySaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_sale_id", nullable = false)
    private PharmacySale pharmacySale;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pharmacy_inventory_id", nullable = false)
    private PharmacyInventory pharmacyInventory;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double total;
}
