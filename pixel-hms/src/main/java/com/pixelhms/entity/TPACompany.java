package com.pixelhms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tpa_companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TPACompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must be at most 150 characters")
    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Size(max = 100, message = "Contact person must be at most 100 characters")
    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Pattern(regexp = "^$|^[0-9]{10,20}$", message = "Mobile number must be between 10 and 20 digits")
    @Column(length = 20)
    private String mobile;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    @Column(length = 100)
    private String email;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
