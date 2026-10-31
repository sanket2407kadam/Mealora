"use client";

import { useEffect, useState } from "react";

type Dish = {
  id: number;
  name: string;
  category: string;
  restaurant: string;
  price: number;
  rating: string;
  time: string;
  image: string;
  color: string;
  tag: string;
};

type MealoraUser = {
  id?: number | string;
  name?: string;
  email?: string;
};

const categories = [
  { name: "All", emoji: "🍽️" },
  { name: "Indian", emoji: "🍛" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Healthy", emoji: "🥗" },
  { name: "Desserts", emoji: "🍰" },
];

const dishes: Dish[] = [
  {
    id: 1,
    name: "Paneer Tikka Bowl",
    category: "Indian",
    restaurant: "Spice Garden",
    price: 249,
    rating: "4.9",
    time: "20–25 min",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85",
    color: "#E9DFC9",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    category: "Pizza",
    restaurant: "The Olive Oven",
    price: 299,
    rating: "4.8",
    time: "25–30 min",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
    color: "#F1DFCC",
    tag: "Popular",
  },
  {
    id: 3,
    name: "Classic Smash Burger",
    category: "Burgers",
    restaurant: "Burger Theory",
    price: 219,
    rating: "4.7",
    time: "15–20 min",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
    color: "#E7E7D5",
    tag: "",
  },
  {
    id: 4,
    name: "Garden Fresh Salad",
    category: "Healthy",
    restaurant: "Green Fork",
    price: 189,
    rating: "4.8",
    time: "15–20 min",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
    color: "#DCE7D8",
    tag: "Fresh pick",
  },
  {
    id: 5,
    name: "Butter Masala Thali",
    category: "Indian",
    restaurant: "Ghar Ka Khana",
    price: 279,
    rating: "4.9",
    time: "25–30 min",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
    color: "#F0DECA",
    tag: "",
  },
  {
    id: 6,
    name: "Chocolate Lava Cake",
    category: "Desserts",
    restaurant: "Sweet Ritual",
    price: 159,
    rating: "4.9",
    time: "15–20 min",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    color: "#E8D9CF",
    tag: "Sweet treat",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load saved cart from localStorage.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("mealoraCart");

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const ids = parsedCart
            .map((item) =>
              typeof item === "number" ? item : Number(item?.id)
            )
            .filter(
              (id) =>
                Number.isInteger(id) &&
                dishes.some((dish) => dish.id === id)
            );

          setCart(ids);
        }
      }
    } catch {
      localStorage.removeItem("mealoraCart");
    }
  }, []);

  // Load logged-in user.
  useEffect(() => {
    const storedUser = sessionStorage.getItem("mealoraUser");

    if (!storedUser) return;

    try {
      const user: MealoraUser = JSON.parse(storedUser);

      if (user && (user.name || user.email)) {
        setUserName(user.name || user.email || "User");
        setIsLoggedIn(true);
      } else {
        sessionStorage.removeItem("mealoraUser");
      }
    } catch {
      sessionStorage.removeItem("mealoraUser");
    }
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("mealoraUser");
    setUserName("");
    setIsLoggedIn(false);
  }

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      activeCategory === "All" ||
      dish.category === activeCategory;

    const matchesSearch =
      `${dish.name} ${dish.restaurant} ${dish.category}`
        .toLowerCase()
        .includes(search.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((total, id) => {
    const dish = dishes.find((item) => item.id === id);
    return total + (dish?.price ?? 0);
  }, 0);

  function toggleFavorite(id: number) {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function addToCart(id: number) {
    const nextCart = [...cart, id];

    setCart(nextCart);
    localStorage.setItem("mealoraCart", JSON.stringify(nextCart));
  }

  return (
    <main>
      <header className="site-header">
        <a href="#discover" className="brand" aria-label="Mealora home">
          <span className="brand-mark">m.</span>
          <span>
            mealora<span className="brand-period">.</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#discover" className="nav-active">
            Discover
          </a>
          <a href="#popular">Our menu</a>
          <a href="#about">About us</a>
        </nav>

        <div className="header-actions">
          <a href="/cart" className="cart-button">
            <span aria-hidden="true">🛒</span> Cart
            <span className="cart-count">{cart.length}</span>
          </a>

          <a href="#popular" className="header-cta">
            Explore food <span>↗</span>
          </a>

          {isLoggedIn ? (
            <div className="user-actions">
              <span className="welcome-user">
                Hi, {userName.split(" ")[0]}!
              </span>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="user-actions">
              <a href="/login" className="login-link">
                Sign in
              </a>

              <a href="/register" className="header-cta">
                Create account <span>↗</span>
              </a>
            </div>
          )}
        </div>
      </header>

      <section className="hero" id="discover">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            GOOD FOOD, GOOD MOOD
          </div>

          <h1>
            Find your
            <br />
            kind of <span>delicious.</span>
          </h1>

          <p className="hero-description">
            Thoughtfully picked meals from the places you love.
            A little comfort, a little adventure — delivered to your door.
          </p>

          <form
            className="hero-search"
            onSubmit={(event) => {
              event.preventDefault();
              document
                .getElementById("popular")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Craving something delicious?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search dishes or restaurants"
            />

            <button type="submit">
              Find food <span>→</span>
            </button>
          </form>

          <div className="hero-trust">
            <span className="trust-stars">★★★★★</span>
            <span>
              <strong>4.9/5</strong> from happy food lovers
            </span>
          </div>

          <div className="hero-stats">
            <div>
              <strong>
                120<span>+</span>
              </strong>
              <small>Local restaurants</small>
            </div>

            <div>
              <strong>
                15<span>k</span>
              </strong>
              <small>Happy customers</small>
            </div>

            <div>
              <strong>
                30<span> min</span>
              </strong>
              <small>Average delivery</small>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="hero-food-art">
            <div className="food-art-inner">
              <span className="food-art-emoji" aria-hidden="true">
                🥗
              </span>
            </div>
          </div>

          <div className="floating-card floating-rating">
            <span className="floating-icon">✦</span>
            <div>
              <strong>Made with care</strong>
              <small>Fresh, every time</small>
            </div>
          </div>

          <div className="floating-card floating-delivery">
            <span className="delivery-icon">↗</span>
            <div>
              <strong>At your doorstep</strong>
              <small>Quick & convenient</small>
            </div>
          </div>

          <span className="decor decor-one">✳</span>
          <span className="decor decor-two">✦</span>
          <span className="decor decor-three">·</span>

          <div className="hero-caption">
            A fresh take on food delivery <span>✳</span>
          </div>
        </div>
      </section>

      <section className="menu-section" id="popular">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR NEXT FAVORITE
            </div>

            <h2>
              Good things to <span>eat.</span>
            </h2>

            <p>
              Made fresh. Picked for you. Always worth the bite.
            </p>
          </div>

          <a href="#popular" className="view-all">
            Explore the menu <span>↗</span>
          </a>
        </div>

        <div className="category-list" aria-label="Filter by category">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setActiveCategory(category.name)}
              className={`category-chip ${
                activeCategory === category.name
                  ? "category-selected"
                  : ""
              }`}
              aria-pressed={activeCategory === category.name}
            >
              <span>{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="food-grid">
          {filteredDishes.map((dish) => (
            <article className="food-card" key={dish.id}>
              <div
                className="food-image"
                style={{ backgroundColor: dish.color }}
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="dish-photo"
                  loading="lazy"
                />

                {dish.tag && (
                  <span className="food-tag">{dish.tag}</span>
                )}

                <button
                  type="button"
                  className="favorite-button"
                  aria-label={
                    favorites.includes(dish.id)
                      ? `Remove ${dish.name} from favorites`
                      : `Add ${dish.name} to favorites`
                  }
                  aria-pressed={favorites.includes(dish.id)}
                  onClick={() => toggleFavorite(dish.id)}
                >
                  {favorites.includes(dish.id) ? "♥" : "♡"}
                </button>
              </div>

              <div className="food-card-content">
                <div className="dish-restaurant">
                  {dish.restaurant}
                </div>

                <h3>{dish.name}</h3>

                <div className="dish-meta">
                  <span>★ {dish.rating}</span>
                  <span>·</span>
                  <span>{dish.time}</span>
                </div>

                <div className="food-card-bottom">
                  <strong>₹{dish.price}</strong>

                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addToCart(dish.id)}
                  >
                    + Add <span className="add-desktop">to cart</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="empty-state">
            <span>🍽️</span>
            <h3>No dishes found</h3>
            <p>Try another search or choose a different category.</p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="menu-note">
          Sample menu for development. Restaurant data will be
          connected to the backend in a later step.
        </p>
      </section>

      <section className="closing-banner" id="about">
        <div>
          <span className="banner-kicker">
            A LITTLE MORE JOY, EVERY DAY
          </span>

          <h2>
            Good food brings us
            <br />a little closer.
          </h2>
        </div>

        <a href="#popular">
          Find your next favorite <span>↗</span>
        </a>

        <span className="banner-leaf" aria-hidden="true">
          ✳
        </span>
      </section>

      <footer className="site-footer">
        <a href="#discover" className="brand footer-brand">
          <span className="brand-mark">m.</span>
          <span>
            mealora<span className="brand-period">.</span>
          </span>
        </a>

        <p>Good food. Thoughtfully delivered.</p>
        <span>© 2026 Mealora. Made with care.</span>
      </footer>

      {cart.length > 0 && (
        <div className="cart-toast" role="status">
          <span>✓</span>
          {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          <strong>₹{cartTotal}</strong>
        </div>
      )}
    </main>
  );
}