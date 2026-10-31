
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id?: number | string;
  name?: string;
  title?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  orderId?: string;
  customer?: Record<string, string>;
  items?: OrderItem[];
  subtotal?: number;
  delivery?: number;
  total?: number;
  payment?: string;
  createdAt?: string;
};

const formatPrice = (amount: number | undefined) =>
  `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("mealoraLastOrder");

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder) as Order);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <main className="os-loading">
        <div className="os-loader" />
        <p>Loading your order...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="os-empty-page">
        <Link href="/" className="os-logo">
          mealora<span>.</span>
        </Link>

        <div className="os-empty-card">
          <div className="os-empty-icon">!</div>
          <h1>No recent order found</h1>
          <p>
            We couldn't find a recent order. Please place an order
            before viewing this page.
          </p>
          <Link href="/" className="os-primary-btn">
            Back to Home <span>→</span>
          </Link>
        </div>
      </main>
    );
  }

  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const customerName =
    customer.fullName || customer.name || "Customer";

  const address = [
    customer.address,
    customer.landmark,
    customer.city,
    customer.pincode || customer.pin,
  ]
    .filter(Boolean)
    .join(", ");

  const parsedDate = order.createdAt
    ? new Date(order.createdAt)
    : null;

  const orderDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Recently placed";

  const paymentMethod = order.payment || "Cash on Delivery";

  return (
    <main className="order-success-page">
      <nav className="os-navbar">
        <Link href="/" className="os-logo">
          mealora<span>.</span>
        </Link>

        <Link href="/" className="os-home-link">
          <span>←</span> Home
        </Link>
      </nav>

      <div className="os-main">
        {/* Order confirmation */}
        <section className="os-success-card">
          <div className="os-check-circle">
            <span>✓</span>
          </div>

          <div className="os-eyebrow">
            <span className="os-eyebrow-line" />
            ORDER CONFIRMED
            <span className="os-eyebrow-line" />
          </div>

          <h1>
            Your order is <span>placed!</span>
          </h1>

          <p className="os-description">
            Thank you for choosing Mealora. Your delicious food
            journey starts here. We're getting your order ready.
          </p>

          <div className="os-order-id">
            <span>YOUR ORDER ID</span>
            <strong>{order.orderId || "ML-ORDER"}</strong>
          </div>

          <div className="os-status">
            <span className="os-status-dot" />
            Order successfully placed
          </div>
        </section>

        {/* Order and delivery information */}
        <div className="os-details-grid">
          <section className="os-details-card">
            <div className="os-card-heading">
              <span className="os-card-icon">📦</span>
              <div>
                <h2>Order details</h2>
                <p>Your order information</p>
              </div>
            </div>

            <div className="os-info-row">
              <span>Order ID</span>
              <strong>{order.orderId || "ML-ORDER"}</strong>
            </div>

            <div className="os-info-row">
              <span>Order date</span>
              <strong>{orderDate}</strong>
            </div>

            <div className="os-info-row">
              <span>Payment method</span>
              <strong>{paymentMethod}</strong>
            </div>

            <div className="os-info-row">
              <span>Payment status</span>
              <strong className="os-pending">
                {paymentMethod.toLowerCase().includes("cash")
                  ? "Pay on delivery"
                  : "Payment selected"}
              </strong>
            </div>
          </section>

          <section className="os-details-card">
            <div className="os-card-heading">
              <span className="os-card-icon">📍</span>
              <div>
                <h2>Delivery address</h2>
                <p>Where we're delivering</p>
              </div>
            </div>

            <h3 className="os-customer-name">{customerName}</h3>

            <p className="os-address">
              {address || "Address not available"}
            </p>

            {customer.phone && (
              <p className="os-contact">
                <span>Phone</span>
                {customer.phone}
              </p>
            )}

            {customer.email && (
              <p className="os-contact">
                <span>Email</span>
                {customer.email}
              </p>
            )}
          </section>
        </div>

        {/* Ordered items */}
        <section className="os-details-card os-items-card">
          <div className="os-card-heading">
            <span className="os-card-icon">🍽️</span>
            <div>
              <h2>Your ordered items</h2>
              <p>
                {items.length} {items.length === 1 ? "item" : "items"}{" "}
                in your order
              </p>
            </div>
          </div>

          <div className="os-items-list">
            {items.length > 0 ? (
              items.map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;

                return (
                  <div className="os-item-row" key={item.id || index}>
                    <div className="os-item-info">
                      <strong>
                        {item.name || item.title || "Food item"}
                      </strong>
                      <span>Quantity: {quantity}</span>
                    </div>

                    <strong className="os-item-price">
                      {formatPrice(price * quantity)}
                    </strong>
                  </div>
                );
              })
            ) : (
              <p className="os-address">No item details available.</p>
            )}
          </div>

          <div className="os-total-section">
            <div className="os-info-row">
              <span>Subtotal</span>
              <strong>{formatPrice(order.subtotal)}</strong>
            </div>

            <div className="os-info-row">
              <span>Delivery fee</span>
              <strong>
                {Number(order.delivery) === 0
                  ? "FREE"
                  : formatPrice(order.delivery)}
              </strong>
            </div>

            <div className="os-grand-total">
              <strong>Total amount</strong>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>
        </section>

        {/* Bottom message */}
        <div className="os-bottom-message">
          <span>🌿</span>
          <p>Freshly prepared. Carefully packed. Made with love.</p>
        </div>

        <div className="os-actions">
          <Link href="/" className="os-primary-btn">
            Continue Shopping <span>→</span>
          </Link>
        </div>
      </div>

      <footer className="os-footer">
        <Link href="/" className="os-logo">
          mealora<span>.</span>
        </Link>
        <p>Fresh food, happy moments.</p>
        <span>© 2026 Mealora. All rights reserved.</span>
      </footer>
    </main>
  );
}
