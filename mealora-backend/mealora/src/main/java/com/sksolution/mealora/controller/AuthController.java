
package com.sksolution.mealora.controller;

import com.sksolution.mealora.dto.RegisterRequest;
import com.sksolution.mealora.dto.LoginRequest;
import com.sksolution.mealora.dto.ChangePasswordRequest;
import com.sksolution.mealora.entity.User;
import com.sksolution.mealora.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Email is already registered."
                    ));
        }

        // BCrypt maximum 72 UTF-8 bytes
        int passwordBytes = request.password()
                .getBytes(StandardCharsets.UTF_8).length;

        if (passwordBytes > 72) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Password must not exceed 72 bytes."
                    ));
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);

        user.setPhone(
                request.phone() == null || request.phone().isBlank()
                        ? null
                        : request.phone().trim()
        );

        user.setPassword(passwordEncoder.encode(request.password()));

        try {
            User savedUser = userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Account created successfully!",
                            "id", savedUser.getId(),
                            "name", savedUser.getName(),
                            "email", savedUser.getEmail()
                    ));

        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This email may already be registered."
                    ));
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null ||
                !passwordEncoder.matches(
                        request.password(),
                        user.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid email or password."
                    ));
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful!",
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail()
                )
        );
    }

    // CHANGE PASSWORD
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "User not found."
                    ));
        }

        // Verify current password
        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Current password is incorrect."
                    ));
        }

        // Check new password confirmation
        if (!request.newPassword().equals(request.confirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "New password and confirm password do not match."
                    ));
        }

        // Prevent reusing current password
        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "New password must be different from current password."
                    ));
        }

        // BCrypt maximum 72 UTF-8 bytes
        int passwordBytes = request.newPassword()
                .getBytes(StandardCharsets.UTF_8).length;

        if (passwordBytes > 72) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "New password must not exceed 72 bytes."
                    ));
        }

        // Encode and save new password
        user.setPassword(
                passwordEncoder.encode(request.newPassword())
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password changed successfully!"
                )
        );
    }
}
