
package com.sksolution.mealora.controller;

import com.sksolution.mealora.dto.AddressRequest;
import com.sksolution.mealora.entity.Address;
import com.sksolution.mealora.entity.User;
import com.sksolution.mealora.repository.AddressRepository;
import com.sksolution.mealora.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:3000")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressController(
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // ADD ADDRESS
    @PostMapping("/{userId}")
    public ResponseEntity<?> addAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        Address address = new Address();

        address.setFullName(request.fullName().trim());
        address.setPhone(request.phone().trim());
        address.setAddressLine(request.addressLine().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPincode(request.pincode().trim());
        address.setLandmark(request.landmark() == null
                ? null : request.landmark().trim());
        address.setAddressType(request.addressType());
        address.setUser(user);

        List<Address> existingAddresses =
                addressRepository.findByUserId(userId);

        boolean makeDefault = request.defaultAddress()
                || existingAddresses.isEmpty();

        if (makeDefault) {
            existingAddresses.forEach(existing -> {
                existing.setDefaultAddress(false);
            });
            addressRepository.saveAll(existingAddresses);
        }

        address.setDefaultAddress(makeDefault);

        Address saved = addressRepository.save(address);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    // GET ALL ADDRESSES
    @GetMapping("/{userId}")
    public ResponseEntity<?> getAddresses(@PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        List<Map<String, Object>> addresses =
                addressRepository.findByUserId(userId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(addresses);
    }

    // UPDATE ADDRESS
    @PutMapping("/{userId}/{addressId}")
    public ResponseEntity<?> updateAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request) {

        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElse(null);

        if (address == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Address not found."));
        }

        address.setFullName(request.fullName().trim());
        address.setPhone(request.phone().trim());
        address.setAddressLine(request.addressLine().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPincode(request.pincode().trim());
        address.setLandmark(request.landmark() == null
                ? null : request.landmark().trim());
        address.setAddressType(request.addressType());

        if (request.defaultAddress()) {
            List<Address> existing =
                    addressRepository.findByUserId(userId);

            existing.forEach(item ->
                    item.setDefaultAddress(false));

            addressRepository.saveAll(existing);
            address.setDefaultAddress(true);
        }

        Address updated = addressRepository.save(address);

        return ResponseEntity.ok(toResponse(updated));
    }

    // SET DEFAULT ADDRESS
    @PutMapping("/{userId}/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId) {

        Address selected = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElse(null);

        if (selected == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Address not found."));
        }

        List<Address> addresses =
                addressRepository.findByUserId(userId);

        addresses.forEach(address ->
                address.setDefaultAddress(false));

        selected.setDefaultAddress(true);

        addressRepository.saveAll(addresses);

        return ResponseEntity.ok(
                Map.of("message", "Default address updated successfully.")
        );
    }

    // DELETE ADDRESS
    @DeleteMapping("/{userId}/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId) {

        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElse(null);

        if (address == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Address not found."));
        }

        boolean wasDefault = address.isDefaultAddress();

        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining =
                    addressRepository.findByUserId(userId);

            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefaultAddress(true);
                addressRepository.save(newDefault);
            }
        }

        return ResponseEntity.ok(
                Map.of("message", "Address deleted successfully.")
        );
    }

    // RESPONSE FORMAT
    private Map<String, Object> toResponse(Address address) {

        Map<String, Object> response = new HashMap<>();

        response.put("id", address.getId());
        response.put("fullName", address.getFullName());
        response.put("phone", address.getPhone());
        response.put("addressLine", address.getAddressLine());
        response.put("city", address.getCity());
        response.put("state", address.getState());
        response.put("pincode", address.getPincode());
        response.put("landmark", address.getLandmark());
        response.put("addressType", address.getAddressType());
        response.put("defaultAddress", address.isDefaultAddress());

        return response;
    }
}
