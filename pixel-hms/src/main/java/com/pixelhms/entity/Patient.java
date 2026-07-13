package com.pixelhms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_uhid", columnList = "uhid"),
    @Index(name = "idx_mobile", columnList = "mobile")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String uhid;

    @NotBlank(message = "Patient name is required")
    @Size(max = 150, message = "Patient name must be at most 150 characters")
    @Column(name = "patient_name", nullable = false, length = 150)
    private String patientName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Size(max = 10, message = "Gender must be at most 10 characters")
    @Column(nullable = false, length = 10)
    private String gender;

    @Size(max = 5, message = "Blood group must be at most 5 characters")
    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile number must be between 10 and 15 digits")
    @Column(nullable = false, length = 15)
    private String mobile;

    @Pattern(regexp = "^$|^[0-9]{10,15}$", message = "Alternate mobile number must be between 10 and 15 digits")
    @Column(name = "alternate_mobile", length = 15)
    private String alternateMobile;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    @Column(length = 100)
    private String email;

    @Size(max = 200, message = "Address must be at most 200 characters")
    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Size(max = 50, message = "City must be at most 50 characters")
    @Column(length = 50)
    private String city;

    @Size(max = 50, message = "State must be at most 50 characters")
    @Column(length = 50)
    private String state;

    @Pattern(regexp = "^$|^[0-9]{6,10}$", message = "Pincode must be between 6 and 10 digits")
    @Column(length = 10)
    private String pincode;

    @Pattern(regexp = "^$|^[0-9]{12}$", message = "Aadhar number must be exactly 12 digits")
    @Column(name = "aadhar_number", length = 12)
    private String aadharNumber;

    @Size(max = 255, message = "Photo path must be at most 255 characters")
    @Column(name = "photo_path", length = 255)
    private String photoPath;

    @Size(max = 50, message = "ABHA ID must be at most 50 characters")
    @Column(name = "abha_id", length = 50)
    private String abhaId;

    @Size(max = 50, message = "ABHA Address must be at most 50 characters")
    @Column(name = "abha_address", length = 50)
    private String abhaAddress;

    @Size(max = 150, message = "Relation name must be at most 150 characters")
    @Column(name = "relation_name", length = 150)
    private String relationName;

    @Size(max = 50, message = "Occupation must be at most 50 characters")
    @Column(length = 50)
    private String occupation;

    @Column(name = "registration_date", updatable = false)
    private LocalDateTime registrationDate;

    @PrePersist
    protected void onCreate() {
        this.registrationDate = LocalDateTime.now();
    }
}
