package com.pixelhms.controller;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private OPRegistrationRepository opRegistrationRepository;

    @Autowired
    private IPRegistrationRepository ipRegistrationRepository;

    @Autowired
    private FinancialTransactionRepository financialTransactionRepository;

    @Autowired
    private PharmacyInventoryRepository pharmacyInventoryRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private WardRepository wardRepository;

    // 1. Doctor Consulting Report Census
    @GetMapping("/consulting")
    public ResponseEntity<List<Map<String, Object>>> getConsultingReport() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<OPRegistration> opVisits = opRegistrationRepository.findAll();
        List<IPRegistration> ipAdmissions = ipRegistrationRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Doctor doc : doctors) {
            long opCount = opVisits.stream()
                .filter(v -> v.getAssignedDoctor() != null && v.getAssignedDoctor().getId().equals(doc.getId()))
                .count();

            long ipCount = ipAdmissions.stream()
                .filter(a -> a.getAdmittingDoctor() != null && a.getAdmittingDoctor().getId().equals(doc.getId()))
                .count();

            Map<String, Object> map = new HashMap<>();
            map.put("doctorId", doc.getId());
            map.put("doctorName", doc.getName());
            map.put("department", doc.getDepartment() != null ? doc.getDepartment().getDeptName() : "General");
            map.put("opCount", opCount);
            map.put("ipCount", ipCount);
            map.put("totalPatients", opCount + ipCount);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // 2. Daily Outpatient Visit Summary
    @GetMapping("/daily-op")
    public ResponseEntity<Map<String, Object>> getDailyOPReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<OPRegistration> visits = opRegistrationRepository.findAll();

        long totalVisits = visits.stream().filter(v -> v.getVisitDate().equals(targetDate)).count();
        long completed = visits.stream().filter(v -> v.getVisitDate().equals(targetDate) && "Completed".equalsIgnoreCase(v.getStatus())).count();
        long waiting = visits.stream().filter(v -> v.getVisitDate().equals(targetDate) && "Waiting".equalsIgnoreCase(v.getStatus())).count();
        long consulting = visits.stream().filter(v -> v.getVisitDate().equals(targetDate) && "InConsultation".equalsIgnoreCase(v.getStatus())).count();

        Map<String, Object> response = new HashMap<>();
        response.put("date", targetDate);
        response.put("totalVisits", totalVisits);
        response.put("completedCount", completed);
        response.put("waitingCount", waiting);
        response.put("consultingCount", consulting);
        return ResponseEntity.ok(response);
    }

    // 3. Collection Report (Cash, Card, UPI, TPA)
    @GetMapping("/collections")
    public ResponseEntity<Map<String, Object>> getCollectionReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<FinancialTransaction> txs = financialTransactionRepository.findAll();
        
        double totalCollected = 0.0;
        double cashTotal = 0.0;
        double cardTotal = 0.0;
        double upiTotal = 0.0;
        double tpaTotal = 0.0;

        double opdBilling = 0.0;
        double ipdBilling = 0.0;
        double pharmacyBilling = 0.0;
        double diagnosticsBilling = 0.0;

        for (FinancialTransaction tx : txs) {
            LocalDate d = tx.getTxDate();
            if ((d.isAfter(start) || d.isEqual(start)) && (d.isBefore(end) || d.isEqual(end))) {
                double amt = tx.getAmount();
                if ("Credit".equalsIgnoreCase(tx.getTxType())) {
                    totalCollected += amt;
                    
                    // Group by Payment Mode
                    if ("Cash".equalsIgnoreCase(tx.getPaymentMode())) cashTotal += amt;
                    else if ("Card".equalsIgnoreCase(tx.getPaymentMode())) cardTotal += amt;
                    else if ("UPI".equalsIgnoreCase(tx.getPaymentMode())) upiTotal += amt;
                    else if ("TPA".equalsIgnoreCase(tx.getPaymentMode())) tpaTotal += amt;

                    // Group by Category
                    if (tx.getCategory() != null) {
                        String cat = tx.getCategory().toLowerCase();
                        if (cat.contains("consultation") || cat.contains("opd")) opdBilling += amt;
                        else if (cat.contains("ipd") || cat.contains("bed") || cat.contains("admission")) ipdBilling += amt;
                        else if (cat.contains("pharmacy") || cat.contains("sale") || cat.contains("drug")) pharmacyBilling += amt;
                        else if (cat.contains("diagnostics") || cat.contains("lab") || cat.contains("investigation")) diagnosticsBilling += amt;
                    }
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("startDate", start);
        response.put("endDate", end);
        response.put("totalCollected", totalCollected);
        
        Map<String, Double> modes = new HashMap<>();
        modes.put("Cash", cashTotal);
        modes.put("Card", cardTotal);
        modes.put("UPI", upiTotal);
        modes.put("TPA", tpaTotal);
        response.put("byMode", modes);

        Map<String, Double> cats = new HashMap<>();
        cats.put("OPD", opdBilling);
        cats.put("IPD", ipdBilling);
        cats.put("Pharmacy", pharmacyBilling);
        cats.put("Diagnostics", diagnosticsBilling);
        response.put("byCategory", cats);

        return ResponseEntity.ok(response);
    }

    // 4. Pharmacy Stock Alerts
    @GetMapping("/pharmacy-stock")
    public ResponseEntity<Map<String, Object>> getPharmacyStockReport() {
        List<PharmacyInventory> items = pharmacyInventoryRepository.findAll();
        List<PharmacyInventory> lowStock = new ArrayList<>();
        List<PharmacyInventory> expiringSoon = new ArrayList<>();
        LocalDate alertDate = LocalDate.now().plusDays(90); // 90 days expiry alert

        for (PharmacyInventory item : items) {
            if (item.getCurrentStock() < 50) {
                lowStock.add(item);
            }
            if (item.getExpiryDate() != null && item.getExpiryDate().isBefore(alertDate)) {
                expiringSoon.add(item);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalItemsCount", items.size());
        response.put("lowStockItems", lowStock);
        response.put("expiringSoonItems", expiringSoon);
        return ResponseEntity.ok(response);
    }

    // 5. Patient Bed Census (Occupancy)
    @GetMapping("/patient-census")
    public ResponseEntity<Map<String, Object>> getPatientCensus() {
        List<Bed> beds = bedRepository.findAll();
        List<Ward> wards = wardRepository.findAll();

        long totalBeds = beds.size();
        long occupiedBeds = beds.stream().filter(b -> !"Available".equalsIgnoreCase(b.getStatus())).count();
        double occupancyRate = totalBeds > 0 ? ((double) occupiedBeds / totalBeds) * 100.0 : 0.0;

        List<Map<String, Object>> wardStats = new ArrayList<>();
        for (Ward ward : wards) {
            long totalWardBeds = beds.stream().filter(b -> b.getWard() != null && b.getWard().getId().equals(ward.getId())).count();
            long occupiedWardBeds = beds.stream().filter(b -> b.getWard() != null && b.getWard().getId().equals(ward.getId()) && !"Available".equalsIgnoreCase(b.getStatus())).count();
            double wardRate = totalWardBeds > 0 ? ((double) occupiedWardBeds / totalWardBeds) * 100.0 : 0.0;

            Map<String, Object> wMap = new HashMap<>();
            wMap.put("wardId", ward.getId());
            wMap.put("wardName", ward.getName());
            wMap.put("totalBeds", totalWardBeds);
            wMap.put("occupiedBeds", occupiedWardBeds);
            wMap.put("occupancyRate", wardRate);
            wardStats.add(wMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalBedsCount", totalBeds);
        response.put("occupiedBedsCount", occupiedBeds);
        response.put("occupancyRate", occupancyRate);
        response.put("wardStatistics", wardStats);
        return ResponseEntity.ok(response);
    }
}
