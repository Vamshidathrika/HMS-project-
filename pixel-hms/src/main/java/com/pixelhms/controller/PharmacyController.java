package com.pixelhms.controller;

import com.pixelhms.entity.PharmacyInventory;
import com.pixelhms.entity.PharmacySale;
import com.pixelhms.entity.PharmacySaleItem;
import com.pixelhms.service.PharmacyService;
import com.pixelhms.service.AuditLogService;
import com.pixelhms.config.SecurityHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy")
@CrossOrigin(origins = "*")
public class PharmacyController {

    @Autowired
    private PharmacyService pharmacyService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SecurityHelper securityHelper;

    public static class StockRequest {
        public String drugCode;
        public String drugName;
        public String batchNumber;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        public LocalDate expiryDate;
        public Integer quantity;
        public Double unitPrice;
        public Double purchasePrice;
    }

    public static class SaleRequest {
        public Long patientId;
        public String uhid;
        public Double totalAmount;
        public Double discountAmount;
        public Double netPayable;
        public String paymentMode;
        public List<PharmacySaleItem> items;
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<PharmacyInventory>> getInventory() {
        return ResponseEntity.ok(pharmacyService.getInventory());
    }

    @PostMapping("/inventory")
    public ResponseEntity<PharmacyInventory> addStock(
            @RequestBody StockRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalUsername = principal.getUsername();
        String finalRole = "anonymous".equals(finalUsername) ? "Pharmacist" : principal.getRole();
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        PharmacyInventory item = pharmacyService.addInventoryStock(
            req.drugCode, req.drugName, req.batchNumber, req.expiryDate,
            req.quantity, req.unitPrice, req.purchasePrice
        );

        // Audit Trail Log
        auditLogService.log(finalUsername, finalRole, "PHARMACY_STOCK_ADD", "Added pharmacy stock intake for drug: " + item.getDrugName() + " (Batch: " + item.getBatchNumber() + ", Qty: " + req.quantity + ")", finalIp, "SUCCESS");

        return ResponseEntity.ok(item);
    }

    @PostMapping("/sales")
    public ResponseEntity<PharmacySale> recordSale(
            @RequestBody SaleRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalUsername = principal.getUsername();
        String finalRole = "anonymous".equals(finalUsername) ? "Pharmacist" : principal.getRole();
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        PharmacySale sale = pharmacyService.recordSale(
            req.patientId, req.uhid, req.totalAmount, req.discountAmount,
            req.netPayable, req.paymentMode, req.items
        );

        // Audit Trail Log
        auditLogService.log(finalUsername, finalRole, "PHARMACY_SALE", "Processed pharmacy sale ID: " + sale.getId() + " for patient UHID: " + sale.getUhid() + " for total: ₹" + sale.getNetPayable() + " via " + sale.getPaymentMode(), finalIp, "SUCCESS");

        return ResponseEntity.ok(sale);
    }

    @GetMapping("/sales")
    public ResponseEntity<List<PharmacySale>> getSales() {
        return ResponseEntity.ok(pharmacyService.getAllSales());
    }
}
