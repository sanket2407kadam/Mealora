
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Dish = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
};

type CartItem = {
  id: number;
  quantity: number;
};

const CART_KEY = "mealoraCart";

const dishes: Dish[] = [
  {
    id: 1,
    name: "Paneer Tikka Bowl",
    category: "North Indian",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    category: "Italian",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 3,
    name: "Classic Smash Burger",
    category: "Burgers",
    price: 219,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 4,
    name: "Garden Fresh Salad",
    category: "Healthy",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 5,
    name: "Butter Masala Thali",
    category: "Indian Meals",
    price: 279,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 6,
    name: "Chocolate Lava Cake",
    category: "Desserts",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=85",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

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
                  dishes.some((dish) => dish.id === item.id)
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

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, loaded]);

  const items = cart
    .map((item) => {
      const dish = dishes.find((food) => food.id === item.id);
      return dish ? { ...dish, quantity: item.quantity } : null;
    })
    .filter((item) => item !== null);

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee =
    subtotal === 0 || subtotal >= 499 ? 0 : 30;

  const total = subtotal + deliveryFee;
  const remaining = Math.max(499 - subtotal, 0);
  const deliveryProgress = Math.min((subtotal / 499) * 100, 100);

  function updateQuantity(id: number, change: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id: number) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  function checkout() {
    if (items.length === 0) {
      alert("Your cart is empty. Please add food items first.");
      return;
    }

    // Navigate to the Checkout page
    window.location.href = "/checkout";
  }

  if (!loaded) {
    return (
      <main className="mealora-cart-loading">
        Loading your cart...
      </main>
    );
  }

  return (
    <main className="mealora-cart">
      <nav className="mc-navbar">
        <Link href="/" className="mc-logo">
          mealora<span>.</span>
        </Link>

        <div className="mc-nav-links">
          <Link href="/">Home</Link>
          <Link href="/#menu">Explore menu</Link>
          <Link href="/cart" className="mc-nav-active">
            My cart
            <span className="mc-nav-count">{itemCount}</span>
          </Link>
        </div>

        <Link href="/#menu" className="mc-back-link">
          <span aria-hidden="true">←</span>
          <span>Continue shopping</span>
        </Link>
      </nav>

      <section className="mc-heading">
        <div className="mc-eyebrow">GOOD FOOD, GOOD MOOD</div>

        <h1>
          Your cart<span>.</span>
        </h1>

        <p>
          {itemCount === 1
            ? "1 delicious item, almost ready."
            : `${itemCount} delicious items, almost ready.`}
        </p>
      </section>

      {items.length === 0 ? (
        <section className="mc-empty">
          <div className="mc-empty-icon">🥗</div>
          <h2>Your cart is feeling lonely</h2>
          <p>
            Discover something delicious and add it to your cart.
          </p>
          <Link href="/#menu" className="mc-primary-link">
            Explore the menu <span>→</span>
          </Link>
        </section>
      ) : (
        <section className="mc-content">
          <div className="mc-items-panel">
            <div className="mc-panel-heading">
              <div>
                <h2>Your items</h2>
                <p>Freshly picked, just for you.</p>
              </div>

              <button
                type="button"
                className="mc-clear-btn"
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>

            <div className="mc-items-list">
              {items.map((item) => (
                <article className="mc-item" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="mc-item-image"
                  />

                  <div className="mc-item-info">
                    <span className="mc-item-category">
                      {item.category}
                    </span>

                    <h3>{item.name}</h3>

                    <p className="mc-item-price">
                      ₹{item.price}
                    </p>

                    <button
                      type="button"
                      className="mc-remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove item
                    </button>
                  </div>

                  <div className="mc-item-actions">
                    <div className="mc-quantity">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <strong className="mc-line-total">
                      ₹{item.price * item.quantity}
                    </strong>
                  </div>
                </article>
              ))}
            </div>

            <Link href="/#menu" className="mc-add-more">
              <span>+</span>
              Add more items
            </Link>
          </div>

          <aside className="mc-summary">
            <div className="mc-summary-eyebrow">YOUR ORDER</div>
            <h2>Order summary</h2>

            <div className="mc-delivery-box">
              <div className="mc-delivery-icon">🚚</div>

              {remaining > 0 ? (
                <p>
                  Add <strong>₹{remaining}</strong> more for free
                  delivery.
                </p>
              ) : (
                <p>
                  <strong>You unlocked free delivery!</strong>
                </p>
              )}

              <div className="mc-progress-track">
                <div
                  className="mc-progress-fill"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>

            <div className="mc-price-row">
              <span>Subtotal ({itemCount} items)</span>
              <strong>₹{subtotal}</strong>
            </div>

            <div className="mc-price-row">
              <span>Delivery fee</span>
              <strong>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </strong>
            </div>

            <div className="mc-summary-divider" />

            <div className="mc-total-row">
              <div>
                <h3>Total</h3>
                <p>Inclusive of applicable charges</p>
              </div>

              <strong>₹{total}</strong>
            </div>

            <button
              type="button"
              className="mc-checkout-btn"
              onClick={checkout}
              disabled={items.length === 0}
            >
              Proceed to checkout <span>→</span>
            </button>

            <div className="mc-care-note">
              <span aria-hidden="true">♧</span>
              <span>Made fresh. Delivered with care.</span>
            </div>

            <div className="mc-secure-note">
              ✓ Secure checkout experience
            </div>
          </aside>
        </section>
      )}

      <footer className="mc-footer">
        <Link href="/" className="mc-footer-logo">
          mealora<span>.</span>
        </Link>
        <p>Made with care, served with flavour.</p>
      </footer>
    </main>
  );
}
