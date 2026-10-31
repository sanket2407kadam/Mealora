
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = {
  id?: number;
  foodId?: number;
  foodName?: string;
  imageUrl?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  id?: number;
  orderCode?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  landmark?: string;
  items?: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: number;
  paymentMethod?: string;
  orderStatus?: string;
  createdAt?: string;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = String(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const lastOrderText = localStorage.getItem("mealoraLastOrder");
        const savedOrdersText = localStorage.getItem("mealoraOrders");

        let email = "";

        if (lastOrderText) {
          const lastOrder = JSON.parse(lastOrderText);
          email = lastOrder?.customer?.email || lastOrder?.email || "";
        }

        if (!email && savedOrdersText) {
          const savedOrders = JSON.parse(savedOrdersText);

          if (Array.isArray(savedOrders) && savedOrders.length > 0) {
            email =
              savedOrders[0]?.customer?.email ||
              savedOrders[0]?.email ||
              "";
          }
        }

        if (!email) {
          throw new Error("Customer email not found.");
        }

        const response = await fetch(
          `http://localhost:8080/api/orders/history?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch order details.");
        }

        const data: Order[] = await response.json();

        const selectedOrder = Array.isArray(data)
          ? data.find((item) => String(item.id) === orderId)
          : undefined;

        if (!selectedOrder) {
          throw new Error("Order not found.");
        }

        setOrder(selectedOrder);

      } catch (err) {
        console.error("Order details error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  // Cancel Order
  const handleCancelOrder = async () => {
    if (!order?.id) {
      setCancelMessage("Invalid order ID.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setCancelMessage("");

      const response = await fetch(
        `http://localhost:8080/api/orders/${order.id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel order."
        );
      }

      setOrder((previousOrder) =>
        previousOrder
          ? {
              ...previousOrder,
              orderStatus: data.orderStatus || "CANCELLED",
            }
          : null
      );

      setCancelMessage("Your order has been cancelled successfully!");

    } catch (err) {
      console.error("Cancel order error:", err);

      setCancelMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling."
      );

    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price?: number) =>
    `₹${(Number(price) || 0).toLocaleString("en-IN")}`;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Placed";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isPlaced =
    order?.orderStatus?.toUpperCase() === "PLACED";

  const isCancelled =
    order?.orderStatus?.toUpperCase() === "CANCELLED";

  return (
    <main className="od-page">
      <nav className="od-navbar">
        <Link href="/" className="od-logo">
          mealora<span>.</span>
        </Link>

        <Link href="/order-history" className="od-back-link">
          ← Order History
        </Link>
      </nav>

      <section className="od-container">
        {loading ? (
          <div className="od-message">
            <div className="od-loader"></div>
            <h2>Loading order details...</h2>
            <p>Please wait while we fetch your order.</p>
          </div>
        ) : error ? (
          <div className="od-message">
            <div className="od-message-icon">⚠️</div>
            <h2>Order not found</h2>
            <p>{error}</p>

            <Link href="/order-history" className="od-button">
              Back to Order History
            </Link>
          </div>
        ) : order ? (
          <>
            <div className="od-heading">
              <span className="od-eyebrow">YOUR MEALORA ORDER</span>
              <h1>Order <span>Details</span></h1>
              <p>Here is everything about your delicious order.</p>
            </div>

            <div className={`od-success ${isCancelled ? "od-cancelled-banner" : ""}`}>
              <div className="od-success-icon">
                {isCancelled ? "✕" : "✓"}
              </div>

              <div>
                <h2>
                  {isCancelled
                    ? "Order Cancelled"
                    : "Order placed successfully!"}
                </h2>

                <p>
                  {isCancelled
                    ? "This order has been cancelled."
                    : "Your order has been recorded with Mealora."}
                </p>
              </div>
            </div>

            <section className="od-card">
              <div className="od-card-heading">
                <div>
                  <span className="od-label">ORDER ID</span>
                  <h2>{order.orderCode || "ML-ORDER"}</h2>
                </div>

                <span className={`od-status ${isCancelled ? "od-status-cancelled" : ""}`}>
                  {formatStatus(order.orderStatus)}
                </span>
              </div>

              <div className="od-info-grid">
                <div>
                  <span>Order Date</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>
                    {order.paymentMethod === "CASH_ON_DELIVERY"
                      ? "Cash on Delivery"
                      : order.paymentMethod || "Not available"}
                  </strong>
                </div>
              </div>
            </section>

            {cancelMessage && (
              <div
                className={`od-cancel-message ${
                  isCancelled ? "od-cancel-message-success" : ""
                }`}
              >
                {cancelMessage}
              </div>
            )}

            <section className="od-card">
              <div className="od-section-heading">
                <span className="od-section-icon">🍽️</span>
                <h2>Ordered Items</h2>
              </div>

              <div className="od-items">
                {order.items?.map((item, index) => {
                  const quantity = Number(item.quantity) || 1;
                  const price = Number(item.price) || 0;

                  return (
                    <div className="od-item" key={item.id || index}>
                      <div className="od-item-info">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.foodName || "Food"}
                          />
                        ) : (
                          <div className="od-food-placeholder">🍴</div>
                        )}

                        <div>
                          <h3>{item.foodName || "Food item"}</h3>
                          <p>Qty: {quantity}</p>
                          <span>{formatPrice(price)} / item</span>
                        </div>
                      </div>

                      <strong>
                        {formatPrice(price * quantity)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="od-card">
              <div className="od-section-heading">
                <span className="od-section-icon">📍</span>
                <h2>Delivery Address</h2>
              </div>

              <div className="od-address">
                <h3>{order.customerName || "Customer"}</h3>
                <p>{order.phone || "Phone unavailable"}</p>
                <p>{order.address || "Address unavailable"}</p>
                <p>
                  {order.city || ""}
                  {order.pincode ? ` - ${order.pincode}` : ""}
                </p>

                {order.landmark && (
                  <p>Landmark: {order.landmark}</p>
                )}

                <p>{order.email}</p>
              </div>
            </section>

            <section className="od-card">
              <div className="od-section-heading">
                <span className="od-section-icon">🧾</span>
                <h2>Payment Summary</h2>
              </div>

              <div className="od-bill">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatPrice(order.subtotal)}</strong>
                </div>

                <div>
                  <span>Delivery Fee</span>
                  <strong>
                    {Number(order.deliveryFee) === 0
                      ? "FREE"
                      : formatPrice(order.deliveryFee)}
                  </strong>
                </div>

                <div className="od-grand-total">
                  <span>Total Amount</span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>
            </section>

            <div className="od-bottom">
              <Link href="/order-history" className="od-button od-secondary">
                ← Back to Orders
              </Link>

              <Link href="/" className="od-button">
                Continue Shopping →
              </Link>
            </div>

            {isPlaced && (
              <div className="od-cancel-section">
                <p>
                  Changed your mind? You can cancel this order
                  before it starts processing.
                </p>

                <button
                  type="button"
                  className="od-cancel-button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            )}
          </>
        ) : null}
      </section>

      <footer className="od-footer">
        <Link href="/" className="od-logo">
          mealora<span>.</span>
        </Link>

        <p>Fresh food, happy moments.</p>
      </footer>
    </main>
  );
}
