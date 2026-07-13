package com.pixelhms.config;

import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class JwtTokenProvider {

    private static final String SECRET_KEY = "ashirwad_hospital_secret_key_secret_key_secret_key";
    private static final String ALGORITHM = "HmacSHA256";

    public String generateToken(String username, String role) {
        try {
            String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            long exp = System.currentTimeMillis() + 864000000; // 10 days
            String payload = String.format("{\"sub\":\"%s\",\"role\":\"%s\",\"exp\":%d}", username, role, exp);

            String encodedHeader = base64UrlEncode(header.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = base64UrlEncode(payload.getBytes(StandardCharsets.UTF_8));

            String signatureInput = encodedHeader + "." + encodedPayload;
            String signature = calculateHmac(signatureInput);

            return signatureInput + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String signatureInput = parts[0] + "." + parts[1];
            String expectedSignature = calculateHmac(signatureInput);
            
            if (!expectedSignature.equals(parts[2])) {
                return false;
            }

            // Expiry check
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            if (payload.contains("\"exp\":")) {
                int expIndex = payload.indexOf("\"exp\":") + 6;
                int endIndex = payload.indexOf("}", expIndex);
                if (endIndex == -1) endIndex = payload.indexOf(",", expIndex);
                String expStr = payload.substring(expIndex, endIndex).trim();
                long exp = Long.parseLong(expStr);
                return System.currentTimeMillis() < exp;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            // Quick extraction of "sub"
            int subIndex = payload.indexOf("\"sub\":\"") + 7;
            int endIndex = payload.indexOf("\"", subIndex);
            return payload.substring(subIndex, endIndex);
        } catch (Exception e) {
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            // Quick extraction of "role"
            int roleIndex = payload.indexOf("\"role\":\"") + 8;
            int endIndex = payload.indexOf("\"", roleIndex);
            return payload.substring(roleIndex, endIndex);
        } catch (Exception e) {
            return null;
        }
    }

    private String base64UrlEncode(byte[] input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(input);
    }

    private String calculateHmac(String data) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256Hmac = Mac.getInstance(ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(hash);
    }
}
