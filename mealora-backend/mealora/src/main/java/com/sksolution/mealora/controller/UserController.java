package com.sksolution.mealora.controller;

import com.sksolution.mealora.entity.User;
import com.sksolution.mealora.repository.UserRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get user profile
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() == null ? "" : user.getPhone(),
                "createdAt", user.getCreatedAt()
        ));
    }

    // Update user profile
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        String name = request.get("name");
        String email = request.get("email");
        String phone = request.get("phone");

        if (name == null || name.trim().length() < 2
                || name.trim().length() > 50) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Name must contain between 2 and 50 characters."));
        }

        if (email == null || !email.trim().matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter a valid email."));
        }

        email = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(id))
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "This email is already registered."));
        }

        if (phone != null && phone.trim().length() > 20) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Phone number cannot exceed 20 characters."));
        }

        user.setName(name.trim());
        user.setEmail(email);
        user.setPhone(
                phone == null || phone.isBlank()
                        ? null
                        : phone.trim()
        );

        try {
            User updatedUser = userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully!",
                    "id", updatedUser.getId(),
                    "name", updatedUser.getName(),
                    "email", updatedUser.getEmail(),
                    "phone", updatedUser.getPhone() == null
                            ? "" : updatedUser.getPhone()
            ));

        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "This email is already registered."));
        }
    }
}