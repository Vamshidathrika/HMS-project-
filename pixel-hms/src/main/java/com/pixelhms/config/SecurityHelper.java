package com.pixelhms.config;

import org.springframework.stereotype.Component;

@Component
public class SecurityHelper {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityHelper(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public static class UserPrincipal {
        private final String username;
        private final String role;

        public UserPrincipal(String username, String role) {
            this.username = username;
            this.role = role;
        }

        public String getUsername() {
            return username;
        }

        public String getRole() {
            return role;
        }
    }

    public UserPrincipal resolvePrincipal(String authHeader) {
        String username = "anonymous";
        String role = "FrontDesk";
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                username = jwtTokenProvider.getUsernameFromToken(token);
                role = jwtTokenProvider.getRoleFromToken(token);
            }
        }
        return new UserPrincipal(username, role);
    }

    public String resolveIpAddress(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return "127.0.0.1";
        }
        return ipAddress;
    }
}
