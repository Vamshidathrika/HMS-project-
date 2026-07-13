package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "ot_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OTBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 20)
    private String uhid;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "surgeon_doctor_id", nullable = false)
    private Doctor surgeon;

    @Column(name = "ot_room", nullable = false, length = 50)
    private String otRoom;

    @Column(name = "surgery_date", nullable = false)
    private LocalDate surgeryDate;

    @Column(name = "surgery_time", nullable = false)
    private LocalTime surgeryTime;

    @Column(name = "surgery_name", nullable = false, length = 150)
    private String surgeryName;

    @Column(name = "pre_op_check_completed")
    private Boolean preOpCheckCompleted = false;

    @Column(nullable = false, length = 30)
    private String status = "Scheduled"; // Scheduled, InProgress, Completed, Cancelled
}
