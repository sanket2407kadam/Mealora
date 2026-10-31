
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type CartItem = {
  id: number;
  quantity: number;
};

type Food = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type ApiOrderResponse = {
  success: boolean;
  message: string;
  orderId: string;
  customerName: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
};

const CART_KEY = "mealoraCart";
const API_URL = "http://localhost:8080/api/orders";

const foods: Food[] = [
  {
    id: 1,
    name: "Paneer Tikka Bowl",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: 3,
    name: "Classic Smash Burger",
    price: 219,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: 4,
    name: "Garden Fresh Salad",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: 5,
    name: "Butter Masala Thali",
    price: 279,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: 6,
    name: "Chocolate Lava Cake",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=120&q=80",
  },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    landmark: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          if (parsed.every((item) => typeof item === "number")) {
            const counts: Record<number, number> = {};

            parsed.forEach((id: number) => {
              counts[id] = (counts[id] || 0) + 1;
            });

            setCart(
              Object.entries(counts).map(([id, quantity]) => ({
                id: Number(id),
                quantity,
              }))
            );
          } else {
            setCart(
              parsed
                .map((item) => ({
                  id: Number(item.id),
                  quantity: Math.max(
                    1,
                    Number(item.quantity) || 1
                  ),
                }))
                .filter((item) =>
                  foods.some((food) => food.id === item.id)
                )
            );
          }
        }
      }
    } catch {
      setCart([]);
    }

    setLoaded(true);
  }, []);

  const items = cart
    .map((item) => {
      const food = foods.find((f) => f.id === item.id);

      return food
        ? { ...food, quantity: item.quantity }
        : null;
    })
    .filter((item) => item !== null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 30;

  const total = subtotal + delivery;

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (!items.length) {
      setError("Your cart is empty. Please add items first.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    if (payment === "online") {
      setError(
        "Online payment is not connected yet. Please select Cash on Delivery."
      );
      return;
    }

    try {
      setSubmitting(true);

      // Prepare request for Spring Boot backend
      const orderRequest = {
        customerName: form.name.trim(),
        phone: form.phone,
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode,
        landmark: form.landmark.trim(),
        paymentMethod: "COD",
        items: items.map((item) => ({
          foodId: item.id,
          quantity: item.quantity,
        })),
      };

      // Call Spring Boot Order API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to place your order."
        );
      }

      const apiOrder = result as ApiOrderResponse;

      // Prepare order data for existing success and history pages
      const order = {
        orderId: apiOrder.orderId,
        customer: form,
        items,
        subtotal: apiOrder.subtotal,
        delivery: apiOrder.deliveryFee,
        total: apiOrder.totalAmount,
        payment: "Cash on Delivery",
        paymentMethod: apiOrder.paymentMethod,
        orderStatus: apiOrder.orderStatus,
        createdAt: apiOrder.createdAt,
      };

      // Save latest order for Order Success page
      localStorage.setItem(
        "mealoraLastOrder",
        JSON.stringify(order)
      );

      // Save all orders for Order History page
      let previousOrders: typeof order[] = [];

      try {
        const savedOrders = localStorage.getItem("mealoraOrders");
        const parsedOrders = savedOrders
          ? JSON.parse(savedOrders)
          : [];

        if (Array.isArray(parsedOrders)) {
          previousOrders = parsedOrders;
        }
      } catch {
        previousOrders = [];
      }

      localStorage.setItem(
        "mealoraOrders",
        JSON.stringify([order, ...previousOrders])
      );

      // Clear cart only after successful backend response
      localStorage.removeItem(CART_KEY);

      // Redirect to Order Success page
      window.location.href = "/order-success";
    } catch (err) {
      console.error("Order placement error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) {
    return (
      <main className="mealora-checkout-loading">
        Loading checkout...
      </main>
    );
  }

  return (
    <main className="mealora-checkout">
      <nav className="co-navbar">
        <Link href="/" className="co-logo">
          mealora<span>.</span>
        </Link>

        <div className="co-steps">
          <Link href="/cart">Cart</Link>
          <span>—</span>
          <strong>Checkout</strong>
        </div>

        <span className="co-secure">
          ✓ Secure checkout
        </span>
      </nav>

      <header className="co-heading">
        <p className="co-eyebrow">ALMOST THERE</p>

        <h1>
          Complete your order<span>.</span>
        </h1>

        <p>Fresh food is just a few details away.</p>
      </header>

      {items.length === 0 ? (
        <section className="co-empty">
          <div>🛒</div>

          <h2>Your cart is empty</h2>

          <p>
            Add your favourite dishes before checking out.
          </p>

          <Link href="/#menu" className="co-primary-btn">
            Explore menu <span>→</span>
          </Link>
        </section>
      ) : (
        <form
          className="co-layout"
          onSubmit={handleSubmit}
        >
          <div className="co-form-column">

            {/* Contact Details */}
            <section className="co-card">
              <div className="co-section-heading">
                <span className="co-step-number">01</span>

                <div>
                  <h2>Contact details</h2>
                  <p>How can we reach you?</p>
                </div>
              </div>

              <div className="co-fields">
                <label className="co-field co-full">
                  Full name

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </label>

                <label className="co-field">
                  Mobile number

                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    required
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                  />
                </label>

                <label className="co-field">
                  Email address

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    required
                    autoComplete="email"
                  />
                </label>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="co-card">
              <div className="co-section-heading">
                <span className="co-step-number">02</span>

                <div>
                  <h2>Delivery address</h2>
                  <p>
                    Where should we deliver your food?
                  </p>
                </div>
              </div>

              <div className="co-fields">
                <label className="co-field co-full">
                  House / Flat / Street address

                  <textarea
                    placeholder="Flat number, building, street, area"
                    value={form.address}
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    required
                    rows={3}
                    autoComplete="street-address"
                  />
                </label>

                <label className="co-field">
                  City

                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    required
                    autoComplete="address-level2"
                  />
                </label>

                <label className="co-field">
                  PIN code

                  <input
                    type="text"
                    placeholder="6-digit PIN code"
                    value={form.pincode}
                    onChange={(e) =>
                      updateField("pincode", e.target.value)
                    }
                    required
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                  />
                </label>

                <label className="co-field co-full">
                  Landmark{" "}
                  <span className="co-optional">
                    (optional)
                  </span>

                  <input
                    type="text"
                    placeholder="Nearby landmark"
                    value={form.landmark}
                    onChange={(e) =>
                      updateField("landmark", e.target.value)
                    }
                  />
                </label>
              </div>
            </section>

            {/* Payment Method */}
            <section className="co-card">
              <div className="co-section-heading">
                <span className="co-step-number">03</span>

                <div>
                  <h2>Payment method</h2>
                  <p>Choose how you want to pay.</p>
                </div>
              </div>

              <div className="co-payment-options">
                <label
                  className={`co-payment-option ${
                    payment === "cod" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                  />

                  <span className="co-payment-icon">
                    💵
                  </span>

                  <span className="co-payment-text">
                    <strong>Cash on Delivery</strong>
                    <small>
                      Pay when your order arrives
                    </small>
                  </span>

                  <span className="co-radio-mark" />
                </label>

                <label
                  className={`co-payment-option ${
                    payment === "online" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={payment === "online"}
                    onChange={() => setPayment("online")}
                  />

                  <span className="co-payment-icon">
                    💳
                  </span>

                  <span className="co-payment-text">
                    <strong>Online payment</strong>
                    <small>
                      UPI, cards and net banking
                    </small>
                  </span>

                  <span className="co-radio-mark" />
                </label>

                {payment === "online" && (
                  <p className="co-payment-notice">
                    Online payment is coming soon. Razorpay
                    will be connected in the next step.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <aside className="co-summary">
            <p className="co-eyebrow">YOUR ORDER</p>

            <h2>Order summary</h2>

            <div className="co-items">
              {items.map((item) => (
                <div
                  className="co-order-item"
                  key={item.id}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="co-order-item-info">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <Link
              href="/cart"
              className="co-edit-cart"
            >
              ← Edit cart
            </Link>

            <div className="co-summary-line">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>

            <div className="co-summary-line">
              <span>Delivery fee</span>

              <strong>
                {delivery === 0
                  ? "FREE"
                  : `₹${delivery}`}
              </strong>
            </div>

            <div className="co-summary-total">
              <div>
                <strong>Total to pay</strong>

                <small>
                  Inclusive of applicable charges
                </small>
              </div>

              <strong>₹{total}</strong>
            </div>

            {error && (
              <p
                className="co-payment-notice"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="co-place-order"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Placing your order..."
                : "Place order"}
              {!submitting && <span>→</span>}
            </button>

            <p className="co-terms">
              By placing your order, you confirm that your
              delivery details are correct.
            </p>

            <div className="co-trust">
              ✓ Freshly prepared <span>•</span> Delivered
              with care
            </div>
          </aside>
        </form>
      )}

      <footer className="co-footer">
        <Link href="/" className="co-footer-logo">
          mealora<span>.</span>
        </Link>

        <p>Made with care, served with flavour.</p>
      </footer>
    </main>
  );
}
