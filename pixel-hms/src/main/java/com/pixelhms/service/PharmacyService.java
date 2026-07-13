package com.pixelhms.service;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class PharmacyService {

    @Autowired
    private PharmacyInventoryRepository inventoryRepository;

    @Autowired
    private PharmacySaleRepository saleRepository;

    @Autowired
    private PharmacySaleItemRepository saleItemRepository;

    @Autowired
    private FinancialTransactionRepository transactionRepository;

    @Autowired
    private PatientRepository patientRepository;

    public List<PharmacyInventory> getInventory() {
        return inventoryRepository.findAll();
    }

    @Transactional
    public PharmacyInventory addInventoryStock(String drugCode, String drugName, String batchNumber, 
                                               LocalDate expiryDate, Integer quantity, 
                                               Double unitPrice, Double purchasePrice) {
        Optional<PharmacyInventory> existing = inventoryRepository.findByDrugCode(drugCode);
        PharmacyInventory item;
        if (existing.isPresent()) {
            item = existing.get();
            item.setCurrentStock(item.getCurrentStock() + quantity);
            item.setBatchNumber(batchNumber);
            item.setExpiryDate(expiryDate);
            item.setUnitPrice(unitPrice);
            item.setPurchasePrice(purchasePrice);
        } else {
            item = new PharmacyInventory();
            item.setDrugCode(drugCode);
            item.setDrugName(drugName);
            item.setBatchNumber(batchNumber);
            item.setExpiryDate(expiryDate);
            item.setCurrentStock(quantity);
            item.setUnitPrice(unitPrice);
            item.setPurchasePrice(purchasePrice);
        }
        return inventoryRepository.save(item);
    }

    @Transactional
    public PharmacySale recordSale(Long patientId, String uhid, Double totalAmount, Double discountAmount, 
                                   Double netPayable, String paymentMode, List<PharmacySaleItem> saleItems) {
        
        Patient patient = null;
        if (patientId != null) {
            patient = patientRepository.findById(patientId).orElse(null);
        }

        PharmacySale sale = new PharmacySale();
        sale.setPatient(patient);
        sale.setUhid(uhid);
        sale.setSaleDate(LocalDate.now());
        sale.setTotalAmount(totalAmount);
        sale.setDiscountAmount(discountAmount);
        sale.setNetPayable(netPayable);
        sale.setPaymentStatus("Paid");
        sale.setPaymentMode(paymentMode);

        PharmacySale savedSale = saleRepository.save(sale);

        for (PharmacySaleItem item : saleItems) {
            PharmacyInventory inventory = inventoryRepository.findById(item.getPharmacyInventory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Drug inventory item not found"));
            
            if (inventory.getCurrentStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for drug: " + inventory.getDrugName());
            }

            // Deduct stock
            inventory.setCurrentStock(inventory.getCurrentStock() - item.getQuantity());
            inventoryRepository.save(inventory);

            item.setPharmacySale(savedSale);
            item.setPharmacyInventory(inventory);
            saleItemRepository.save(item);
        }

        // Record a Financial Transaction
        FinancialTransaction tx = new FinancialTransaction();
        tx.setTxDate(LocalDate.now());
        tx.setTxTime(LocalTime.now());
        tx.setPatientName(patient != null ? patient.getPatientName() : "Walk-in Patient");
        tx.setUhid(uhid);
        tx.setCategory("Pharmacy Sale");
        tx.setTxType("Credit");
        tx.setAmount(netPayable);
        tx.setPaymentMode(paymentMode);
        tx.setReferenceId("PHAR-" + savedSale.getId());
        tx.setRemarks("Pharmacy Drug Sale");
        transactionRepository.save(tx);

        return savedSale;
    }

    public List<PharmacySale> getAllSales() {
        return saleRepository.findAll();
    }
}
