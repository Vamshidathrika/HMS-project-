package com.pixelhms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionSheetDTO {
    private String uhid;
    private Long opId;
    private String patientName;
    private LocalDate dob;
    private String ageYears;
    private String gender;
    private String address;
    private String visitType;
    private Integer visitNumber;
    private Double consultationFees;
    private String feesInWords;
    private String date;
    private String time;
    private String fatherOrHusbandName;
    private String referredBy;
    private String contactNumber;
    private String patientCategory;
    private String consultantName;
    private String qualification;
    private String designation;
    private String registrationNumber;
    private Integer tokenNumber;
}
