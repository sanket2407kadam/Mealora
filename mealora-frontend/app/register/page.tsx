
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password.length > 72) {
      setError("Password cannot exceed 72 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://mealora-pc4s.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone: phone || null,
            password,
          }),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      let data: Record<string, unknown> = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            response.status === 415
              ? "Backend rejected the request format (415). Check the registration API."
              : `Server returned HTTP ${response.status}. ${responseText.slice(0, 200)}`
          );
        }
      }

      if (!response.ok) {
        const message =
          typeof data.message === "string"
            ? data.message
            : response.status === 409
              ? "This email is already registered."
              : response.status === 400
                ? "Please check your details and try again."
                : `Registration failed (HTTP ${response.status}).`;

        setError(message);
        return;
      }

      setSuccess(
        typeof data.message === "string"
          ? `${data.message} Redirecting to login...`
          : "Account created successfully! Redirecting to login..."
      );

      window.setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Mealora registration error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to Mealora backend. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page register-page">
      <Link href="/" className="auth-brand">
        mealora<span>.</span>
      </Link>

      <section className="auth-card register-card">
        <Link href="/" className="auth-back">
          ← Back to home
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">JOIN THE TABLE</span>
          <h1>Your next favourite meal starts here.</h1>
          <p>
            Create your Mealora account and make every meal special.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            minLength={2}
            maxLength={50}
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={150}
            required
          />

          <label htmlFor="phone">Phone number (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            maxLength={20}
          />

          <label htmlFor="password">Create password</label>
          <div className="auth-password">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="button"
              className="auth-show-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="auth-password">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="button"
              className="auth-show-password"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success" role="status">
              {success}
            </p>
          )}

          <label className="auth-terms">
            <input type="checkbox" name="terms" required />
            <span>
              I agree to the{" "}
              <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </span>
          </label>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
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
