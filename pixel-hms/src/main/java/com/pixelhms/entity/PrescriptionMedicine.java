package com.pixelhms.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicine {
    private String medicineName;
    private String dosage;       // e.g., "1-0-1", "1 tablet"
    private String frequency;    // e.g., "Once daily", "Twice daily"
    private String duration;     // e.g., "5 days"
    private String instruction;  // e.g., "After food", "Before food"
}
