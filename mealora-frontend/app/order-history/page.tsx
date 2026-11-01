
"use client";

import Link from "next/link";
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
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  addressType?: string;
  items?: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: number;
  paymentMethod?: string;
  orderStatus?: string;
  createdAt?: string;
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrderHistory() {
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
          setOrders([]);
          setError("Customer email not found. Please place an order first.");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/api/orders/history?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch your orders.");
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Order history error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading orders."
        );
      } finally {
        setLoaded(true);
      }
    }

    fetchOrderHistory();
  }, []);

  const formatPrice = (price?: number) =>
    `₹${(Number(price) || 0).toLocaleString("en-IN")}`;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
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

  return (
    <main className="oh-page">
      <nav className="oh-navbar">
        <Link href="/" className="oh-logo">
          mealora<span>.</span>
        </Link>

        <Link href="/" className="oh-home-link">
          ← Back to Home
        </Link>
      </nav>

      <section className="oh-container">
        <div className="oh-heading">
          <span className="oh-eyebrow">YOUR MEALORA ACCOUNT</span>

          <h1>
            Order <span>History</span>
          </h1>

          <p>
            Keep track of your delicious moments with Mealora.
          </p>
        </div>

        <div className="oh-count">
          <div>
            <strong>{orders.length}</strong>
            <span>Total Orders</span>
          </div>

          <span className="oh-count-icon">📦</span>
        </div>

        {!loaded ? (
          <div className="oh-empty">
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="oh-empty">
            <div className="oh-empty-icon">⚠️</div>
            <h2>Unable to load orders</h2>
            <p>{error}</p>

            <Link href="/" className="oh-button">
              Back to Home →
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="oh-empty">
            <div className="oh-empty-icon">🍽️</div>

            <h2>No orders yet</h2>

            <p>
              Your delicious food journey starts with your first order.
            </p>

            <Link href="/" className="oh-button">
              Explore Menu →
            </Link>
          </div>
        ) : (
          <div className="oh-orders">
            {orders.map((order, index) => {
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              return (
                <Link
                  href={
                    order.id
                      ? `/order-details/${order.id}`
                      : "/order-history"
                  }
                  className="oh-order-link"
                  key={order.id || order.orderCode || index}
                >
                  <article className="oh-order-card">
                    <div className="oh-order-top">
                      <div>
                        <span className="oh-label">ORDER ID</span>

                        <h2>{order.orderCode || "ML-ORDER"}</h2>

                        <p>{formatDate(order.createdAt)}</p>
                      </div>

                      <span className="oh-status">
                        ✓ {formatStatus(order.orderStatus)}
                      </span>
                    </div>

                    <div className="oh-order-items">
                      {items.map((item, itemIndex) => {
                        const quantity = Number(item.quantity) || 1;
                        const price = Number(item.price) || 0;

                        return (
                          <div
                            className="oh-item"
                            key={item.id || itemIndex}
                          >
                            <div>
                              <strong>
                                {item.foodName || "Food item"}
                              </strong>

                              <span>Qty: {quantity}</span>
                            </div>

                            <strong>
                              {formatPrice(price * quantity)}
                            </strong>
                          </div>
                        );
                      })}
                    </div>

                    <div className="oh-delivery-address">
                      <div className="oh-address-heading">
                        <strong>📍 Delivery Address</strong>

                        {order.addressType && (
                          <span>{order.addressType}</span>
                        )}
                      </div>

                      <p>{order.customerName || "Customer"}</p>

                      <p>
                        {[
                          order.address,
                          order.landmark,
                          order.city,
                          order.state,
                          order.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address not available"}
                      </p>
                    </div>

                    <div className="oh-order-bottom">
                      <div>
                        <span>Payment</span>

                        <strong>
                          {order.paymentMethod === "CASH_ON_DELIVERY"
                            ? "Cash on Delivery"
                            : order.paymentMethod || "Not available"}
                        </strong>
                      </div>

                      <div className="oh-order-total">
                        <span>Total Amount</span>

                        <strong>
                          {formatPrice(order.totalAmount)}
                        </strong>
                      </div>
                    </div>

                    <div className="oh-view-details">
                      View Order Details →
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        <div className="oh-bottom">
          <Link href="/" className="oh-button">
            Continue Shopping →
          </Link>
        </div>
      </section>

      <footer className="oh-footer">
        <Link href="/" className="oh-logo">
          mealora<span>.</span>
        </Link>

        <p>Fresh food, happy moments.</p>
      </footer>
    </main>
  );
}
