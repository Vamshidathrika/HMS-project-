package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "whatsapp_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 20)
    private String uhid;

    @Column(name = "patient_name", nullable = false, length = 150)
    private String patientName;

    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Column(name = "template_name", nullable = false, length = 50)
    private String templateName;

    @Column(nullable = false, length = 20)
    private String status; // Sent, Delivered, Read, Failed

    @Column(name = "error_message", length = 255)
    private String errorMessage;
}
