package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ip_registration_id", nullable = false)
    private IPRegistration ipRegistration;

    @Column(name = "note_date_time", nullable = false)
    private LocalDateTime noteDateTime;

    // Vitals
    private Integer pulse;
    
    @Column(length = 20)
    private String bp; // e.g. "120/80"
    
    private Double temperature; // e.g. 98.6
    
    private Integer spo2; // e.g. 98
    
    @Column(name = "respiratory_rate")
    private Integer respiratoryRate; // e.g. 18

    @Column(name = "progress_note", columnDefinition = "TEXT")
    private String progressNote;

    @Column(name = "treatment_notes", columnDefinition = "TEXT")
    private String treatmentNotes;

    @Column(name = "recorded_by", length = 150)
    private String recordedBy; // e.g. "Dr. Rajesh Sharma" or "Nurse Staff"
}
