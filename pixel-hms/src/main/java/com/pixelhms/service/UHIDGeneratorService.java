package com.pixelhms.service;

import com.pixelhms.entity.UHIDSequence;
import com.pixelhms.repository.UHIDSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class UHIDGeneratorService {

    @Autowired
    private UHIDSequenceRepository sequenceRepository;

    /**
     * Generates a unique 15-digit sequential UHID in YYMMDD[facilityCode][paddedSequence] format.
     */
    @Transactional
    public synchronized String generate(String facilityCode) {
        UHIDSequence sequence = sequenceRepository.findById(facilityCode)
                .orElseGet(() -> {
                    UHIDSequence newSeq = new UHIDSequence(facilityCode, 0L);
                    return sequenceRepository.saveAndFlush(newSeq);
                });
        
        long nextVal = sequence.getCurrentSequence() + 1;
        sequence.setCurrentSequence(nextVal);
        sequenceRepository.saveAndFlush(sequence);
        
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        return datePart + facilityCode + String.format("%07d", nextVal);
    }

    /**
     * Previews the next unique 15-digit sequential UHID without incrementing the sequence in the database.
     */
    @Transactional(readOnly = true)
    public synchronized String preview(String facilityCode) {
        UHIDSequence sequence = sequenceRepository.findById(facilityCode)
                .orElse(new UHIDSequence(facilityCode, 0L));
        
        long nextVal = sequence.getCurrentSequence() + 1;
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        return datePart + facilityCode + String.format("%07d", nextVal);
    }
}
