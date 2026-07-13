package com.pixelhms.controller;

import com.pixelhms.entity.Bill;
import com.pixelhms.entity.BillItem;
import com.pixelhms.entity.FinancialTransaction;
import com.pixelhms.service.BillingService;
import com.pixelhms.service.AuditLogService;
import com.pixelhms.service.WhatsAppService;
import com.pixelhms.config.SecurityHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private SecurityHelper securityHelper;

    public static class BillRequest {
        public Long patientId;
        public String billType;
        public Double totalAmount;
        public Double discountPercent;
        public Double discountAmount;
        public Double advanceAdjusted;
        public Double netPayable;
        public String paymentMode;
        public String cashDrawer;
        public String remarks;
        public List<BillItem> items;
    }

    @PostMapping("/bills")
    public ResponseEntity<Bill> createBill(
            @RequestBody BillRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        Bill bill = billingService.createBill(
            req.patientId, req.billType, req.totalAmount, req.discountPercent,
            req.discountAmount, req.advanceAdjusted, req.netPayable,
            req.paymentMode, req.cashDrawer, req.remarks, req.items
        );

        // Audit Trail Log
        auditLogService.log(principal.getUsername(), principal.getRole(), "BILL_CREATE", "Generated patient " + bill.getBillType() + " invoice: " + bill.getUhid() + " for total: ₹" + bill.getNetPayable() + " via " + bill.getPaymentMode(), finalIp, "SUCCESS");

        // WhatsApp Notification
        whatsAppService.sendBillInvoiceMessage(bill.getPatient(), bill.getUhid(), String.valueOf(bill.getNetPayable()));

        return ResponseEntity.ok(bill);
    }

    @GetMapping("/bills")
    public ResponseEntity<List<Bill>> getBills(@RequestParam(value = "uhid", required = false) String uhid) {
        if (uhid != null && !uhid.isEmpty()) {
            return ResponseEntity.ok(billingService.getBillsByUhid(uhid));
        }
        return ResponseEntity.ok(billingService.getAllBills());
    }

    @GetMapping("/bills/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getBillById(id));
    }

    @PutMapping("/bills/{id}")
    public ResponseEntity<Bill> updateBill(
            @PathVariable Long id,
            @RequestBody Bill details,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        Bill updated = billingService.updateBill(id, details);
        auditLogService.log(principal.getUsername(), principal.getRole(), "BILL_UPDATE", "Updated patient bill ID: " + updated.getId() + " for total: ₹" + updated.getNetPayable(), finalIp, "SUCCESS");
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/bills/{id}")
    public ResponseEntity<Void> deleteBill(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String finalIp = securityHelper.resolveIpAddress(ipAddress);

        billingService.deleteBill(id);
        auditLogService.log(principal.getUsername(), principal.getRole(), "BILL_DELETE", "Deleted bill ID: " + id, finalIp, "SUCCESS");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<FinancialTransaction>> getTransactions(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(billingService.getTransactionsByDate(searchDate));
    }

    @GetMapping("/reports/daybook")
    public ResponseEntity<Map<String, Object>> getDayBookSummary(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        List<FinancialTransaction> txs = billingService.getTransactionsByDate(searchDate);
        
        double totalCredit = 0.0;
        double totalDebit = 0.0;
        double cashTotal = 0.0;
        double cardTotal = 0.0;
        double upiTotal = 0.0;
        double tpaTotal = 0.0;

        for (FinancialTransaction tx : txs) {
            if ("Credit".equalsIgnoreCase(tx.getTxType())) {
                totalCredit += tx.getAmount();
                if ("Cash".equalsIgnoreCase(tx.getPaymentMode())) {
                    cashTotal += tx.getAmount();
                } else if ("Card".equalsIgnoreCase(tx.getPaymentMode())) {
                    cardTotal += tx.getAmount();
                } else if ("UPI".equalsIgnoreCase(tx.getPaymentMode())) {
                    upiTotal += tx.getAmount();
                } else if ("TPA".equalsIgnoreCase(tx.getPaymentMode())) {
                    tpaTotal += tx.getAmount();
                }
            } else {
                totalDebit += tx.getAmount();
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("date", searchDate);
        summary.put("totalCredit", totalCredit);
        summary.put("totalDebit", totalDebit);
        summary.put("cashTotal", cashTotal);
        summary.put("cardTotal", cardTotal);
        summary.put("upiTotal", upiTotal);
        summary.put("tpaTotal", tpaTotal);
        summary.put("transactions", txs);

        return ResponseEntity.ok(summary);
    }
}
