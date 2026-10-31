
package com.sksolution.mealora.service;

import com.sksolution.mealora.dto.OrderRequest;
import com.sksolution.mealora.entity.Order;
import com.sksolution.mealora.entity.OrderItem;
import com.sksolution.mealora.repository.OrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Temporary menu catalogue
    private static final Map<Long, MenuFood> MENU = Map.of(
            1L, new MenuFood("Paneer Tikka Bowl", new BigDecimal("249.00")),
            2L, new MenuFood("Margherita Pizza", new BigDecimal("299.00")),
            3L, new MenuFood("Classic Smash Burger", new BigDecimal("219.00")),
            4L, new MenuFood("Garden Fresh Salad", new BigDecimal("189.00")),
            5L, new MenuFood("Butter Masala Thali", new BigDecimal("279.00")),
            6L, new MenuFood("Chocolate Lava Cake", new BigDecimal("159.00"))
    );

    private record MenuFood(String name, BigDecimal price) {
    }

    // Place Order
    @Transactional
    public Order placeOrder(OrderRequest request) {

        validateRequest(request);

        Order order = new Order();

        order.setOrderCode(
                "ML" + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 8)
                        .toUpperCase()
        );

        order.setCustomerName(request.customerName().trim());
        order.setPhone(request.phone().trim());
        order.setEmail(request.email().trim().toLowerCase());
        order.setAddress(request.address().trim());
        order.setCity(request.city().trim());
        order.setPincode(request.pincode().trim());
        order.setLandmark(request.landmark());

        order.setPaymentMethod("CASH_ON_DELIVERY");

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest requestedItem : request.items()) {

            MenuFood food = MENU.get(requestedItem.foodId());

            if (food == null) {
                throw new IllegalArgumentException(
                        "Invalid food ID: " + requestedItem.foodId()
                );
            }

            if (requestedItem.quantity() == null ||
                    requestedItem.quantity() < 1 ||
                    requestedItem.quantity() > 20) {

                throw new IllegalArgumentException(
                        "Quantity must be between 1 and 20."
                );
            }

            BigDecimal itemTotal = food.price().multiply(
                    BigDecimal.valueOf(requestedItem.quantity())
            );

            subtotal = subtotal.add(itemTotal);

            OrderItem item = new OrderItem();

            item.setFoodId(requestedItem.foodId());
            item.setFoodName(food.name());
            item.setPrice(food.price());
            item.setQuantity(requestedItem.quantity());

            order.addItem(item);
        }

        BigDecimal deliveryFee = subtotal.compareTo(
                new BigDecimal("499.00")
        ) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("30.00");

        BigDecimal total = subtotal.add(deliveryFee);

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    // Get Order History By Customer Email
    @Transactional(readOnly = true)
    public List<Order> getOrdersByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        return orderRepository.findAllByEmailOrderByCreatedAtDesc(
                email.trim().toLowerCase()
        );
    }

    // Cancel Order
    @Transactional
    public Order cancelOrder(Long orderId) {

        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException(
                    "Invalid order ID."
            );
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Order not found."
                ));

        if (!"PLACED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException(
                    "This order cannot be cancelled because it is already being processed or completed."
            );
        }

        order.setOrderStatus("CANCELLED");

        return orderRepository.save(order);
    }

    // Validate Order Request
    private void validateRequest(OrderRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Order request is required."
            );
        }

        if (isBlank(request.customerName()) ||
                request.customerName().trim().length() < 2 ||
                request.customerName().trim().length() > 100) {

            throw new IllegalArgumentException(
                    "Enter a valid customer name."
            );
        }

        if (request.phone() == null ||
                !Pattern.matches("[6-9][0-9]{9}", request.phone().trim())) {

            throw new IllegalArgumentException(
                    "Enter a valid 10-digit mobile number."
            );
        }

        if (request.email() == null ||
                !Pattern.matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$",
                        request.email().trim()
                )) {

            throw new IllegalArgumentException(
                    "Enter a valid email address."
            );
        }

        if (isBlank(request.address()) ||
                request.address().trim().length() > 500) {

            throw new IllegalArgumentException(
                    "Enter a valid delivery address."
            );
        }

        if (isBlank(request.city())) {
            throw new IllegalArgumentException(
                    "City is required."
            );
        }

        if (request.pincode() == null ||
                !Pattern.matches("[0-9]{6}", request.pincode().trim())) {

            throw new IllegalArgumentException(
                    "Enter a valid 6-digit PIN code."
            );
        }

        if (request.items() == null ||
                request.items().isEmpty() ||
                request.items().size() > 50) {

            throw new IllegalArgumentException(
                    "Your order must contain valid food items."
            );
        }

        if (request.paymentMethod() == null ||
                !request.paymentMethod().equalsIgnoreCase("COD")) {

            throw new IllegalArgumentException(
                    "Currently only Cash on Delivery is available."
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
