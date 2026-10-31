package com.sksolution.mealora.dto;

import java.util.List;

public record OrderRequest(
        String customerName,
        String phone,
        String email,
        String address,
        String city,
        String pincode,
        String landmark,
        String paymentMethod,
        List<OrderItemRequest> items
) {
    public record OrderItemRequest(
            Long foodId,
            Integer quantity
    ) {
    }
}