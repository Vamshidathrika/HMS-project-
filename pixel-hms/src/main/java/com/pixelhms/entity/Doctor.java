package com.pixelhms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Doctor code is required")
    @Size(max = 20, message = "Doctor code must be at most 20 characters")
    @Column(name = "doctor_code", unique = true, nullable = false, length = 20)
    private String doctorCode;

    @NotBlank(message = "Doctor name is required")
    @Size(max = 150, message = "Doctor name must be at most 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 100, message = "Qualification must be at most 100 characters")
    @Column(length = 100)
    private String qualification;

    @Size(max = 100, message = "Specialization must be at most 100 characters")
    @Column(length = 100)
    private String specialization;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @Pattern(regexp = "^$|^[0-9]{10,15}$", message = "Mobile number must be between 10 and 15 digits")
    @Column(length = 15)
    private String mobile;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    @Column(length = 100)
    private String email;

    @Column(name = "consulting_fee", precision = 10, scale = 2)
    private BigDecimal consultingFee;
}
