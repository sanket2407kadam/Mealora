
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const response = await fetch(
        "https://mealora-pc4s.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message ||
            (response.status === 401
              ? "Invalid email or password."
              : `Login failed (${response.status}). Please try again.`)
        );
        return;
      }

      sessionStorage.setItem(
        "mealoraUser",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        })
      );

      router.push("/");
    } catch (err) {
      console.error("Mealora login error:", err);

      setError(
        "Unable to connect to Mealora server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand">
        mealora<span>.</span>
      </Link>

      <section className="auth-card">
        <Link href="/" className="auth-back">
          ← Back to home
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Good food awaits.</h1>
          <p>Sign in to discover your next favourite meal.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <div className="auth-label-row">
            <label htmlFor="password">Password</label>

            <button
              className="auth-text-button"
              type="button"
              onClick={() =>
                alert("Password recovery will be added later.")
              }
            >
              Forgot password?
            </button>
          </div>

          <div className="auth-password">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              minLength={8}
            />

            <button
              type="button"
              className="auth-show-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}{" "}
            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="auth-switch">
          New to Mealora?{" "}
          <Link href="/register">Create an account</Link>
        </p>

        <div className="auth-note">
          <span>✳</span> Thoughtful food. Beautifully simple.
        </div>
      </section>

      <p className="auth-footer">
        © 2026 Mealora · Made for food lovers
      </p>
    </main>
  );
}
