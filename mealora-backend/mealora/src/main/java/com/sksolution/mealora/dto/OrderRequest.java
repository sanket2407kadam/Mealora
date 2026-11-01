
package com.sksolution.mealora.dto;

import java.util.List;

public record OrderRequest(
        String customerName,
        String phone,
        String email,
        String address,
        String city,
        String state,
        String pincode,
        String landmark,
        String addressType,
        String paymentMethod,
        List<OrderItemRequest> items
) {
    public record OrderItemRequest(
            Long foodId,
            Integer quantity
    ) {
    }
}
