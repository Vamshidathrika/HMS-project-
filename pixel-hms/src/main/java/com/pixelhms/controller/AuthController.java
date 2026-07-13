package com.pixelhms.controller;

import com.pixelhms.config.JwtTokenProvider;
import com.pixelhms.entity.User;
import com.pixelhms.repository.UserRepository;
import com.pixelhms.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = "127.0.0.1";
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.isActive() && passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());
                
                // Audit log login success
                auditLogService.log(user.getUsername(), user.getRole(), "LOGIN", "Successfully logged into the system.", ipAddress, "SUCCESS");

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("username", user.getUsername());
                response.put("role", user.getRole());
                response.put("fullName", user.getFullName());
                return ResponseEntity.ok(response);
            }
        }

        // Audit log login failure
        auditLogService.log(username, "Guest", "LOGIN", "Failed login attempt for username: " + username, ipAddress, "FAILURE");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        
        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        // Audit log user creation
        auditLogService.log("system", "SuperAdmin", "USER_CREATE", "Created new system user: " + user.getUsername() + " (" + user.getRole() + ")", "127.0.0.1", "SUCCESS");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            if (!user.getUsername().equals(userDetails.getUsername()) &&
                userRepository.findByUsername(userDetails.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }
            
            user.setUsername(userDetails.getUsername());
            user.setRole(userDetails.getRole());
            user.setFullName(userDetails.getFullName());
            user.setActive(userDetails.isActive());
            
            if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            
            User updated = userRepository.save(user);
            auditLogService.log("system", "SuperAdmin", "USER_UPDATE", "Updated user account: " + updated.getUsername(), "127.0.0.1", "SUCCESS");
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            auditLogService.log("system", "SuperAdmin", "USER_DELETE", "Deleted user account: " + user.getUsername(), "127.0.0.1", "SUCCESS");
            return ResponseEntity.ok().body(Map.of("message", "User deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
