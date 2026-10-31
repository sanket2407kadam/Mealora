
package com.sksolution.mealora.controller;

import com.sksolution.mealora.dto.OrderRequest;
import com.sksolution.mealora.entity.Order;
import com.sksolution.mealora.entity.OrderItem;
import com.sksolution.mealora.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Test API
    @GetMapping("/test")
    public ResponseEntity<?> test() {

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mealora Order API is working!");

        return ResponseEntity.ok(response);
    }

    // Place Order
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {

        try {
            Order savedOrder = orderService.placeOrder(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order placed successfully!");
            response.put("orderId", savedOrder.getId());
            response.put("orderCode", savedOrder.getOrderCode());
            response.put("totalAmount", savedOrder.getTotalAmount());
            response.put("orderStatus", savedOrder.getOrderStatus());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());

            return ResponseEntity.badRequest().body(error);

        } catch (Exception ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", "Unable to place order. Please try again.");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }

    // Get Order History By Email
    @GetMapping("/history")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrderHistory(
            @RequestParam(name = "email") String email) {

        try {
            List<Order> orders = orderService.getOrdersByEmail(email);

            List<Map<String, Object>> response = new ArrayList<>();

            for (Order order : orders) {

                Map<String, Object> orderData = new HashMap<>();

                orderData.put("id", order.getId());
                orderData.put("orderCode", order.getOrderCode());
                orderData.put("customerName", order.getCustomerName());
                orderData.put("phone", order.getPhone());
                orderData.put("email", order.getEmail());
                orderData.put("address", order.getAddress());
                orderData.put("city", order.getCity());
                orderData.put("pincode", order.getPincode());
                orderData.put("landmark", order.getLandmark());
                orderData.put("subtotal", order.getSubtotal());
                orderData.put("deliveryFee", order.getDeliveryFee());
                orderData.put("totalAmount", order.getTotalAmount());
                orderData.put("paymentMethod", order.getPaymentMethod());
                orderData.put("orderStatus", order.getOrderStatus());
                orderData.put("createdAt", order.getCreatedAt());

                List<Map<String, Object>> items = new ArrayList<>();

                for (OrderItem item : order.getItems()) {

                    Map<String, Object> itemData = new HashMap<>();

                    itemData.put("id", item.getId());
                    itemData.put("foodId", item.getFoodId());
                    itemData.put("foodName", item.getFoodName());
                    itemData.put("imageUrl", item.getImageUrl());
                    itemData.put("price", item.getPrice());
                    itemData.put("quantity", item.getQuantity());

                    items.add(itemData);
                }

                orderData.put("items", items);
                response.add(orderData);
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());

            return ResponseEntity.badRequest().body(error);

        } catch (Exception ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", "Unable to fetch order history.");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }

    // Cancel Order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId) {

        try {
            Order cancelledOrder = orderService.cancelOrder(orderId);

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Order cancelled successfully!");
            response.put("orderId", cancelledOrder.getId());
            response.put("orderCode", cancelledOrder.getOrderCode());
            response.put("orderStatus", cancelledOrder.getOrderStatus());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());

            return ResponseEntity.badRequest().body(error);

        } catch (IllegalStateException ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(error);

        } catch (Exception ex) {

            Map<String, String> error = new HashMap<>();
            error.put("message", "Unable to cancel order. Please try again.");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }
}
