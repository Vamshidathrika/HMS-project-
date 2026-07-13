package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_masters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_code", unique = true, nullable = false, length = 20)
    private String testCode;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "test_category", nullable = false, length = 50)
    private String testCategory;

    private double price;

    @Column(name = "is_active")
    private boolean isActive = true;
}
