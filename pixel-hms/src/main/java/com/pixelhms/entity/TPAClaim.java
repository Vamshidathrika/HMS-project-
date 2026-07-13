package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "tpa_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TPAClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ip_registration_id", nullable = false)
    private IPRegistration ipRegistration;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tpa_company_id", nullable = false)
    private TPACompany tpaCompany;

    @Column(nullable = false, length = 20)
    private String uhid;

    @Column(name = "ip_number", nullable = false, length = 50)
    private String ipNumber;

    @Column(name = "claim_amount", nullable = false)
    private Double claimAmount;

    @Column(name = "approved_amount")
    private Double approvedAmount;

    @Column(name = "pre_auth_status", nullable = false, length = 30)
    private String preAuthStatus = "Requested"; // Requested, Approved, Settled, Rejected

    @Column(name = "pre_auth_code", length = 50)
    private String preAuthCode;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
