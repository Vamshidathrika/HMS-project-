package com.pixelhms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/abha")
@CrossOrigin(origins = "*")
public class AbhaController {

    public static class OTPRequest {
        public String abhaNumber;
        public String mobile;
    }

    public static class VerifyRequest {
        public String txnId;
        public String otp;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody OTPRequest req) {
        Map<String, Object> response = new HashMap<>();
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        response.put("txnId", txnId);
        response.put("message", "Simulated OTP sent to registered mobile number successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        if (!"123456".equals(req.otp)) {
            response.put("error", "Invalid OTP. Please use default test OTP 123456.");
            return ResponseEntity.badRequest().body(response);
        }

        // Return a mock verified ABHA citizen profile details
        response.put("abhaId", "1234-5678-9012-34");
        response.put("abhaAddress", "rahul.verma@ndhm");
        response.put("patientName", "Rahul Verma");
        response.put("gender", "M");
        response.put("dateOfBirth", "1988-10-15");
        response.put("mobile", "9876543210");
        response.put("relationName", "Sanjay Verma");
        response.put("addressLine1", "Flat 402, Lotus Residency, Sector 15, Dwarka");
        response.put("pincode", "110075");
        response.put("state", "Delhi");
        response.put("city", "New Delhi");
        response.put("status", "SUCCESS");
        return ResponseEntity.ok(response);
    }
}
