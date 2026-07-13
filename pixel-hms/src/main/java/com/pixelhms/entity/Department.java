package com.pixelhms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Department code is required")
    @Size(max = 20, message = "Department code must be at most 20 characters")
    @Column(name = "dept_code", unique = true, nullable = false, length = 20)
    private String deptCode;

    @NotBlank(message = "Department name is required")
    @Size(max = 100, message = "Department name must be at most 100 characters")
    @Column(name = "dept_name", nullable = false, length = 100)
    private String deptName;

    @Size(max = 50, message = "Department type must be at most 50 characters")
    @Column(name = "dept_type", length = 50)
    private String deptType;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
