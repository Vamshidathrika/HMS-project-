package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Table(name = "surgery_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ot_booking_id", nullable = false)
    private OTBooking otBooking;

    @Column(name = "assistant_surgeon", length = 150)
    private String assistantSurgeon;

    @Column(name = "anesthesia_type", length = 50)
    private String anesthesiaType; // General, Spinal, Local, Epidural

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(columnDefinition = "TEXT")
    private String complications;

    @Column(name = "post_op_notes", columnDefinition = "TEXT")
    private String postOpNotes;

    @Column(name = "surgery_notes", columnDefinition = "TEXT")
    private String surgeryNotes;
}
