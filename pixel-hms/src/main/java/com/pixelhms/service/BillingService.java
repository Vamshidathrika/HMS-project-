package com.pixelhms.service;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BillingService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillItemRepository billItemRepository;

    @Autowired
    private FinancialTransactionRepository transactionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private IPRegistrationRepository ipRegistrationRepository;

    @Transactional
    public Bill createBill(Long patientId, String billType, Double totalAmount, Double discountPercent, 
                           Double discountAmount, Double advanceAdjusted, Double netPayable, 
                           String paymentMode, String cashDrawer, String remarks, List<BillItem> items) {
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id " + patientId));

        Bill bill = new Bill();
        bill.setPatient(patient);
        bill.setUhid(patient.getUhid());
        bill.setBillType(billType);
        bill.setBillDate(LocalDate.now());
        bill.setTotalAmount(totalAmount);
        bill.setDiscountPercent(discountPercent);
        bill.setDiscountAmount(discountAmount);
        bill.setAdvanceAdjusted(advanceAdjusted);
        bill.setNetPayable(netPayable);
        bill.setPaymentMode(paymentMode);
        bill.setCashDrawer(cashDrawer);
        bill.setRemarks(remarks);
        bill.setStatus("Paid");

        Bill savedBill = billRepository.save(bill);

        if (items != null) {
            for (BillItem item : items) {
                item.setBill(savedBill);
                billItemRepository.save(item);
            }
        }

        // Record a Financial Transaction
        FinancialTransaction tx = new FinancialTransaction();
        tx.setTxDate(LocalDate.now());
        tx.setTxTime(LocalTime.now());
        tx.setPatientName(patient.getPatientName());
        tx.setUhid(patient.getUhid());
        tx.setCategory(billType.equals("IP") ? "IPD Billing" : "OPD Consultation");
        tx.setTxType("Credit");
        tx.setAmount(netPayable);
        tx.setPaymentMode(paymentMode);
        tx.setReferenceId("INV-" + savedBill.getId());
        tx.setRemarks(remarks);
        transactionRepository.save(tx);

        // If it's an IP billing, let's find the active IP admission and mark it total bill
        if (billType.equals("IP")) {
            List<IPRegistration> admissions = ipRegistrationRepository.findByUhid(patient.getUhid());
            for (IPRegistration reg : admissions) {
                if (reg.getStatus().equals("Admitted")) {
                    reg.setTotalBill(java.math.BigDecimal.valueOf(netPayable));
                    ipRegistrationRepository.save(reg);
                }
            }
        }

        return savedBill;
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public List<Bill> getBillsByUhid(String uhid) {
        return billRepository.findByUhid(uhid);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found with id " + id));
    }

    public List<FinancialTransaction> getTransactionsByDate(LocalDate date) {
        return transactionRepository.findByTxDate(date);
    }

    @Transactional
    public Bill updateBill(Long id, Bill details) {
        Bill bill = getBillById(id);
        bill.setTotalAmount(details.getTotalAmount());
        bill.setDiscountPercent(details.getDiscountPercent());
        bill.setDiscountAmount(details.getDiscountAmount());
        bill.setAdvanceAdjusted(details.getAdvanceAdjusted());
        bill.setNetPayable(details.getNetPayable());
        bill.setPaymentMode(details.getPaymentMode());
        bill.setCashDrawer(details.getCashDrawer());
        bill.setRemarks(details.getRemarks());
        bill.setStatus(details.getStatus());
        return billRepository.save(bill);
    }

    @Transactional
    public void deleteBill(Long id) {
        Bill bill = getBillById(id);
        billRepository.delete(bill);
    }
}
