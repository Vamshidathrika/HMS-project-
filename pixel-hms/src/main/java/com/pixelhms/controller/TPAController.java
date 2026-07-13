package com.pixelhms.controller;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tpa")
@CrossOrigin(origins = "*")
public class TPAController {

    @Autowired
    private TPACompanyRepository tpaCompanyRepository;

    @Autowired
    private TPAClaimRepository tpaClaimRepository;

    @Autowired
    private IPRegistrationRepository ipRegistrationRepository;

    @GetMapping("/companies")
    public ResponseEntity<List<TPACompany>> getCompanies() {
        return ResponseEntity.ok(tpaCompanyRepository.findAll());
    }

    @PostMapping("/companies")
    public ResponseEntity<TPACompany> createCompany(@Valid @RequestBody TPACompany company) {
        TPACompany saved = tpaCompanyRepository.save(company);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<TPACompany> getCompanyById(@PathVariable Long id) {
        return tpaCompanyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<TPACompany> updateCompany(@PathVariable Long id, @Valid @RequestBody TPACompany details) {
        return tpaCompanyRepository.findById(id).map(company -> {
            company.setName(details.getName());
            company.setContactPerson(details.getContactPerson());
            company.setMobile(details.getMobile());
            company.setEmail(details.getEmail());
            company.setIsActive(details.getIsActive());
            return ResponseEntity.ok(tpaCompanyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        return tpaCompanyRepository.findById(id).map(company -> {
            tpaCompanyRepository.delete(company);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/claims")
    public ResponseEntity<List<TPAClaim>> getClaims(@RequestParam(value = "uhid", required = false) String uhid) {
        if (uhid != null && !uhid.isEmpty()) {
            return ResponseEntity.ok(tpaClaimRepository.findByUhid(uhid));
        }
        return ResponseEntity.ok(tpaClaimRepository.findAll());
    }

    public static class ClaimRequest {
        public Long ipRegistrationId;
        public Long tpaCompanyId;
        public String uhid;
        public String ipNumber;
        public Double claimAmount;
        public Double approvedAmount;
        public String preAuthStatus;
        public String preAuthCode;
        public String remarks;
    }

    @PostMapping("/claims")
    public ResponseEntity<TPAClaim> createOrUpdateClaim(@RequestBody ClaimRequest req) {
        IPRegistration ipReg = ipRegistrationRepository.findById(req.ipRegistrationId)
                .orElseThrow(() -> new IllegalArgumentException("IP Registration not found"));
        
        TPACompany company = tpaCompanyRepository.findById(req.tpaCompanyId)
                .orElseThrow(() -> new IllegalArgumentException("TPA Company not found"));

        TPAClaim claim = new TPAClaim();
        claim.setIpRegistration(ipReg);
        claim.setTpaCompany(company);
        claim.setUhid(req.uhid);
        claim.setIpNumber(req.ipNumber);
        claim.setClaimAmount(req.claimAmount);
        claim.setApprovedAmount(req.approvedAmount);
        claim.setPreAuthStatus(req.preAuthStatus);
        claim.setPreAuthCode(req.preAuthCode);
        claim.setApprovalDate(LocalDate.now());
        claim.setRemarks(req.remarks);

        TPAClaim saved = tpaClaimRepository.save(claim);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<TPAClaim> getClaimById(@PathVariable Long id) {
        TPAClaim claim = tpaClaimRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("TPA Claim not found"));
        return ResponseEntity.ok(claim);
    }

    @PutMapping("/claims/{id}")
    public ResponseEntity<TPAClaim> updateClaim(@PathVariable Long id, @RequestBody TPAClaim details) {
        return tpaClaimRepository.findById(id).map(claim -> {
            claim.setClaimAmount(details.getClaimAmount());
            claim.setApprovedAmount(details.getApprovedAmount());
            claim.setPreAuthStatus(details.getPreAuthStatus());
            claim.setPreAuthCode(details.getPreAuthCode());
            claim.setRemarks(details.getRemarks());
            return ResponseEntity.ok(tpaClaimRepository.save(claim));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/claims/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        return tpaClaimRepository.findById(id).map(claim -> {
            tpaClaimRepository.delete(claim);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
