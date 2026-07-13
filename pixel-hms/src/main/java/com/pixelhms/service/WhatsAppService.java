package com.pixelhms.service;

import com.pixelhms.entity.Patient;
import com.pixelhms.entity.WhatsAppLog;
import com.pixelhms.entity.WhatsAppTemplate;
import com.pixelhms.repository.WhatsAppLogRepository;
import com.pixelhms.repository.WhatsAppTemplateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class WhatsAppService {

    @Autowired
    private WhatsAppTemplateRepository templateRepository;

    @Autowired
    private WhatsAppLogRepository logRepository;

    private static final String NODE_SERVER_URL = "http://localhost:3001";
    
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private String sendPostRequest(String url, String jsonBody) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            System.err.println("Error calling WhatsApp Node server POST: " + e.getMessage());
            return null;
        }
    }

    private String sendGetRequest(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            System.err.println("Error calling WhatsApp Node server GET: " + e.getMessage());
            return null;
        }
    }

    public boolean isClientConnected() {
        try {
            String response = sendGetRequest(NODE_SERVER_URL + "/api/status");
            if (response != null) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> map = mapper.readValue(response, Map.class);
                String status = (String) map.get("status");
                return "connected".equals(status);
            }
        } catch (Exception e) {
            System.err.println("Error checking WhatsApp status: " + e.getMessage());
        }
        return false;
    }

    public String getDetailedStatus() {
        String response = sendGetRequest(NODE_SERVER_URL + "/api/status");
        if (response != null) {
            return response;
        }
        return "{\"status\":\"disconnected\",\"connected\":false}";
    }

    public String triggerConnect() {
        String response = sendPostRequest(NODE_SERVER_URL + "/api/connect", "{}");
        return response != null ? response : "{\"success\":false,\"message\":\"Node server unreachable\"}";
    }

    public String triggerDisconnect() {
        String response = sendPostRequest(NODE_SERVER_URL + "/api/logout", "{}");
        return response != null ? response : "{\"success\":false,\"message\":\"Node server unreachable\"}";
    }

    public boolean sendMessage(String phone, String text) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = Map.of("phone", phone, "text", text);
            String jsonBody = mapper.writeValueAsString(body);
            String response = sendPostRequest(NODE_SERVER_URL + "/api/send", jsonBody);
            if (response != null) {
                Map<String, Object> map = mapper.readValue(response, Map.class);
                return Boolean.TRUE.equals(map.get("success"));
            }
        } catch (Exception e) {
            System.err.println("Error sending message to Node server: " + e.getMessage());
        }
        return false;
    }

    public void sendWelcomeMessage(Patient patient) {
        String templateName = "Welcome";
        String defaultText = "Hello {{name}}! Welcome to Ashirwad Hospital. Your unique patient UHID is {{uhid}}. Thank you for choosing us.";
        
        String messageText = getProcessedMessage(templateName, defaultText)
                .replace("{{name}}", patient.getPatientName())
                .replace("{{uhid}}", patient.getUhid());

        saveLog(patient.getUhid(), patient.getPatientName(), patient.getMobile(), messageText, templateName);
    }

    public void sendOPRegistrationMessage(Patient patient, String doctorName, String tokenNumber) {
        String templateName = "OPD Ticket";
        String defaultText = "Dear {{name}}, your outpatient visit consultation is confirmed with {{doctor}}. Your queue token number is {{token}}. Please wait for your turn.";
        
        String messageText = getProcessedMessage(templateName, defaultText)
                .replace("{{name}}", patient.getPatientName())
                .replace("{{doctor}}", doctorName)
                .replace("{{token}}", tokenNumber);

        saveLog(patient.getUhid(), patient.getPatientName(), patient.getMobile(), messageText, templateName);
    }

    public void sendBillInvoiceMessage(Patient patient, String invoiceNumber, String amount) {
        String templateName = "Bill Invoice";
        String defaultText = "Dear {{name}}, your billing invoice {{invoice}} for amount {{amount}} has been successfully generated. Thank you, Ashirwad Hospital.";
        
        String messageText = getProcessedMessage(templateName, defaultText)
                .replace("{{name}}", patient.getPatientName())
                .replace("{{invoice}}", invoiceNumber)
                .replace("{{amount}}", amount);

        saveLog(patient.getUhid(), patient.getPatientName(), patient.getMobile(), messageText, templateName);
    }

    public void sendIPAdmissionMessage(Patient patient, String wardName, String bedNumber) {
        String templateName = "IP Admission";
        String defaultText = "Dear {{name}}, your inpatient admission is complete. Allocated Ward: {{ward}}, Bed: {{bed}}. We wish you a speedy recovery.";
        
        String messageText = getProcessedMessage(templateName, defaultText)
                .replace("{{name}}", patient.getPatientName())
                .replace("{{ward}}", wardName)
                .replace("{{bed}}", bedNumber);

        saveLog(patient.getUhid(), patient.getPatientName(), patient.getMobile(), messageText, templateName);
    }

    private String getProcessedMessage(String templateName, String defaultText) {
        Optional<WhatsAppTemplate> templateOpt = templateRepository.findByName(templateName);
        if (templateOpt.isPresent() && templateOpt.get().isActive()) {
            return templateOpt.get().getTemplateText();
        }
        return defaultText;
    }

    private void saveLog(String uhid, String name, String mobile, String text, String template) {
        WhatsAppLog log = new WhatsAppLog();
        log.setTimestamp(LocalDateTime.now());
        log.setUhid(uhid);
        log.setPatientName(name);
        log.setMobile(mobile);
        log.setMessageText(text);
        log.setTemplateName(template);
        
        boolean sent = sendMessage(mobile, text);
        
        if (sent) {
            log.setStatus("Sent");
        } else {
            log.setStatus("Failed");
            log.setErrorMessage("WhatsApp client disconnected or Node server unreachable.");
        }
        
        logRepository.save(log);
    }
}

