
package com.sksolution.mealora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(

        @NotBlank(message = "Full name is required.")
        @Size(max = 50, message = "Name cannot exceed 50 characters.")
        String fullName,

        @NotBlank(message = "Phone number is required.")
        @Pattern(regexp = "^[0-9]{10}$",
                message = "Enter a valid 10-digit phone number.")
        String phone,

        @NotBlank(message = "Address is required.")
        @Size(max = 255)
        String addressLine,

        @NotBlank(message = "City is required.")
        @Size(max = 100)
        String city,

        @NotBlank(message = "State is required.")
        @Size(max = 100)
        String state,

        @NotBlank(message = "Pincode is required.")
        @Pattern(regexp = "^[0-9]{6}$",
                message = "Enter a valid 6-digit pincode.")
        String pincode,

        @Size(max = 100)
        String landmark,

        @NotBlank(message = "Address type is required.")
        @Pattern(regexp = "^(Home|Work|Other)$",
                message = "Address type must be Home, Work or Other.")
        String addressType,

        boolean defaultAddress
) {}
