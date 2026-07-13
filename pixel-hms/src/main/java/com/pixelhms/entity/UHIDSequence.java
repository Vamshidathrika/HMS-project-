package com.pixelhms.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "uhid_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UHIDSequence {
    @Id
    private String facilityCode;
    private Long currentSequence;
}
