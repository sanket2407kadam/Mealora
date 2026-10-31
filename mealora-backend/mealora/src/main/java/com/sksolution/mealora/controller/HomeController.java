package com.sksolution.mealora.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/api")
    public Map<String, String> home() {
        return Map.of(
                "application", "Mealora",
                "message", "Mealora Backend is running!",
                "status", "success"
        );
    }
}