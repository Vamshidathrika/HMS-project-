package com.pixelhms.controller;

import com.pixelhms.dto.PrescriptionSheetDTO;
import com.pixelhms.entity.OPRegistration;
import com.pixelhms.repository.OPRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@RestController
@RequestMapping("/api/op")
@CrossOrigin(origins = "*")
public class OPPrescriptionController {

    @Autowired
    private OPRegistrationRepository registrationRepository;

    @GetMapping("/patient/{opId}/prescription-sheet")
    public ResponseEntity<PrescriptionSheetDTO> getPrescriptionSheet(@PathVariable Long opId) {
        return registrationRepository.findById(opId)
                .map(this::mapToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private PrescriptionSheetDTO mapToDTO(OPRegistration reg) {
        PrescriptionSheetDTO dto = new PrescriptionSheetDTO();
        dto.setUhid(reg.getUhid());
        dto.setOpId(reg.getId());
        
        if (reg.getPatient() != null) {
            dto.setPatientName(reg.getPatient().getPatientName());
            dto.setDob(reg.getPatient().getDateOfBirth());
            
            String rawGender = reg.getPatient().getGender();
            if ("M".equalsIgnoreCase(rawGender) || "Male".equalsIgnoreCase(rawGender)) {
                dto.setGender("Male");
            } else if ("F".equalsIgnoreCase(rawGender) || "Female".equalsIgnoreCase(rawGender)) {
                dto.setGender("Female");
            } else {
                dto.setGender("Other");
            }
            
            dto.setAddress(reg.getPatient().getAddressLine1() != null ? reg.getPatient().getAddressLine1() : "N/A");
            dto.setFatherOrHusbandName(reg.getPatient().getRelationName() != null ? reg.getPatient().getRelationName() : "N/A");
            dto.setContactNumber(reg.getPatient().getMobile() != null ? reg.getPatient().getMobile() : "");
        } else {
            dto.setPatientName("N/A");
            dto.setGender("N/A");
            dto.setAddress("N/A");
            dto.setFatherOrHusbandName("N/A");
            dto.setContactNumber("");
        }

        dto.setAgeYears(reg.getAgeValue() != null ? reg.getAgeValue() + " " + (reg.getAgeUnit() != null ? reg.getAgeUnit() : "Yrs") : "N/A");
        dto.setVisitType(reg.getVisitType() != null ? reg.getVisitType() : "New");
        dto.setVisitNumber(reg.getEntryNumber() != null ? reg.getEntryNumber() : 1);
        
        Double fees = reg.getConsultingFee() != null ? reg.getConsultingFee() : 0.0;
        dto.setConsultationFees(fees);
        dto.setFeesInWords(convertNumberToWords(fees));

        // Format Date and Time
        String dateStr = "";
        if (reg.getVisitDate() != null) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MMM/yyyy", Locale.ENGLISH);
            dateStr = reg.getVisitDate().format(dateFormatter);
        }
        String timeStr = "";
        if (reg.getVisitTime() != null) {
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
            timeStr = reg.getVisitTime().format(timeFormatter);
        }
        dto.setDate(dateStr);
        dto.setTime(timeStr);

        dto.setReferredBy(reg.getReferringDoctor() != null ? reg.getReferringDoctor() : "SELF");
        dto.setPatientCategory(reg.getPatientCategory() != null ? reg.getPatientCategory() : "General");

        if (reg.getAssignedDoctor() != null) {
            dto.setConsultantName(reg.getAssignedDoctor().getName());
            dto.setQualification(reg.getAssignedDoctor().getQualification() != null ? reg.getAssignedDoctor().getQualification() : "");
            dto.setDesignation(reg.getAssignedDoctor().getSpecialization() != null ? reg.getAssignedDoctor().getSpecialization() : "Consultant");
            dto.setRegistrationNumber(reg.getAssignedDoctor().getDoctorCode() != null ? "TSMC/REG/" + reg.getAssignedDoctor().getDoctorCode() : "");
        } else {
            dto.setConsultantName("N/A");
            dto.setQualification("");
            dto.setDesignation("Consultant");
            dto.setRegistrationNumber("");
        }

        dto.setTokenNumber(reg.getTokenNumber() != null ? reg.getTokenNumber() : 0);

        return dto;
    }

    private static final String[] units = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
    private static final String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

    public static String convertNumberToWords(double number) {
        if (number == 0) {
            return "Rupees Zero Only";
        }
        long ru = (long) number;
        return "Rupees " + convertIntegerToWords(ru) + " Only.";
    }

    private static String convertIntegerToWords(long number) {
        if (number < 0) {
            return "Minus " + convertIntegerToWords(-number);
        }
        if (number < 20) {
            return units[(int) number];
        }
        if (number < 100) {
            return tens[(int) (number / 10)] + ((number % 10 != 0) ? " " : "") + units[(int) (number % 10)];
        }
        if (number < 1000) {
            return units[(int) (number / 100)] + " Hundred" + ((number % 100 != 0) ? " and " : "") + convertIntegerToWords(number % 100);
        }
        if (number < 100000) { // Thousand
            return convertIntegerToWords(number / 1000) + " Thousand" + ((number % 1000 != 0) ? " " : "") + convertIntegerToWords(number % 1000);
        }
        if (number < 10000000) { // Lakh
            return convertIntegerToWords(number / 100000) + " Lakh" + ((number % 100000 != 0) ? " " : "") + convertIntegerToWords(number % 100000);
        }
        // Crore
        return convertIntegerToWords(number / 10000000) + " Crore" + ((number % 10000000 != 0) ? " " : "") + convertIntegerToWords(number % 10000000);
    }
}
