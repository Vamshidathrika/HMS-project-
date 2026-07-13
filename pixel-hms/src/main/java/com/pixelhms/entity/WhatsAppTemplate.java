package com.pixelhms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "whatsapp_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String name; // e.g., Welcome, OPD Ticket, IP Admission, Bill Invoice

    @Column(nullable = false, columnDefinition = "TEXT")
    private String templateText;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
