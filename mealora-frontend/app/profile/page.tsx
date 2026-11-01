
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./globals.css";

type User = {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
};

type Address = {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: "Home" | "Work" | "Other";
  defaultAddress: boolean;
};

type AddressForm = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  addressType: "Home" | "Work" | "Other";
  defaultAddress: boolean;
};

const API_URL = "http://https://mealora-pc4s.onrender.com/api/users";
const AUTH_API_URL = "http://https://mealora-pc4s.onrender.com/api/auth";
const ADDRESS_API_URL = "http://https://mealora-pc4s.onrender.com/api/addresses";

const emptyAddressForm: AddressForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  addressType: "Home",
  defaultAddress: false,
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Change Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // My Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] =
    useState<AddressForm>(emptyAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);

  // Load logged-in user
  useEffect(() => {
    const storedUser = sessionStorage.getItem("mealoraUser");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("mealoraUser");
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }

    setLoading(false);
  }, []);

  // Load addresses when user is available
  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // EDIT PROFILE FUNCTIONS
  const openEditProfile = async () => {
    if (!user?.id) {
      alert("User ID not found. Please login again.");
      return;
    }

    setShowEditModal(true);
    setFetchingProfile(true);
    setMessage("");
    setError("");

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    try {
      const response = await fetch(`${API_URL}/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load profile.");
      }

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });

      setUser((previous) => ({
        ...previous,
        ...data,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load profile details."
      );
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?.id) {
      setError("User ID not found. Please login again.");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.phone.trim().length > 20) {
      setError("Phone number cannot exceed 20 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed.");
      }

      const updatedUser: User = {
        ...user,
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
      };

      setUser(updatedUser);
      sessionStorage.setItem("mealoraUser", JSON.stringify(updatedUser));

      setMessage("Your profile has been updated successfully!");

      setTimeout(() => {
        setShowEditModal(false);
        setMessage("");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const closeEditModal = () => {
    if (!saving) {
      setShowEditModal(false);
      setError("");
      setMessage("");
    }
  };

  // CHANGE PASSWORD FUNCTIONS
  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordMessage("");
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (!changingPassword) {
      setShowPasswordModal(false);
      setPasswordError("");
      setPasswordMessage("");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handlePasswordInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?.id) {
      setPasswordError("User ID not found. Please login again.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    try {
      const response = await fetch(
        `${AUTH_API_URL}/${user.id}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswordMessage(
        data.message || "Password changed successfully!"
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 1500);
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // MY ADDRESSES FUNCTIONS
  const fetchAddresses = async () => {
    if (!user?.id) return;

    setLoadingAddresses(true);
    setAddressError("");

    try {
      const response = await fetch(
        `${ADDRESS_API_URL}/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load addresses.");
      }

      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      setAddressError(
        err instanceof Error
          ? err.message
          : "Unable to load addresses."
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressError("");
    setAddressMessage("");
    setShowAddressModal(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddressId(address.id);

    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
      addressType: address.addressType || "Home",
      defaultAddress: address.defaultAddress || false,
    });

    setAddressError("");
    setAddressMessage("");
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    if (!savingAddress) {
      setShowAddressModal(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm);
      setAddressError("");
    }
  };

  const handleAddressInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;

      setAddressForm((previous) => ({
        ...previous,
        [name]: checked,
      }));
      return;
    }

    setAddressForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveAddress = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?.id) {
      setAddressError("User ID not found. Please login again.");
      return;
    }

    if (!/^[0-9]{10}$/.test(addressForm.phone.trim())) {
      setAddressError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(addressForm.pincode.trim())) {
      setAddressError("Please enter a valid 6-digit pincode.");
      return;
    }

    setSavingAddress(true);
    setAddressError("");
    setAddressMessage("");

    try {
      const url = editingAddressId
        ? `${ADDRESS_API_URL}/${user.id}/${editingAddressId}`
        : `${ADDRESS_API_URL}/${user.id}`;

      const response = await fetch(url, {
        method: editingAddressId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...addressForm,
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          addressLine: addressForm.addressLine.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pincode: addressForm.pincode.trim(),
          landmark: addressForm.landmark.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save address.");
      }

      setAddressMessage(
        editingAddressId
          ? "Address updated successfully!"
          : "Address added successfully!"
      );

      await fetchAddresses();

      setTimeout(() => {
        setShowAddressModal(false);
        setEditingAddressId(null);
        setAddressForm(emptyAddressForm);
        setAddressMessage("");
      }, 700);
    } catch (err) {
      setAddressError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${ADDRESS_API_URL}/${user.id}/${addressId}/default`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to set default address.");
      }

      setAddressMessage("Default address updated successfully!");
      await fetchAddresses();
    } catch (err) {
      setAddressError(
        err instanceof Error
          ? err.message
          : "Unable to update default address."
      );
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    setAddressError("");
    setAddressMessage("");

    try {
      const response = await fetch(
        `${ADDRESS_API_URL}/${user.id}/${addressId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete address.");
      }

      setAddressMessage("Address deleted successfully!");
      await fetchAddresses();
    } catch (err) {
      setAddressError(
        err instanceof Error
          ? err.message
          : "Unable to delete address."
      );
    }
  };

  const scrollToAddresses = () => {
    document.getElementById("my-addresses")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // LOGOUT
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("mealoraUser");
      window.location.href = "/login";
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading your account...</div>;
  }

  if (!user) return null;

  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <main className="profile-page">
      {/* NAVBAR */}
      <nav className="profile-navbar">
        <Link href="/" className="profile-logo">
          Mealora<span>.</span>
        </Link>

        <div className="profile-nav-links">
          <Link href="/">Home</Link>
          <Link href="/#menu">Menu</Link>
          <Link href="/order-history">My Orders</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="profile-container">
        <div className="profile-heading">
          <div>
            <p>MY ACCOUNT</p>
            <h1>My Account</h1>
            <span>Welcome back! Manage your Mealora account.</span>
          </div>
        </div>

        {/* PROFILE BANNER */}
        <div className="profile-banner">
          <div className="profile-banner-user">
            <div className="profile-avatar">{initial}</div>

            <div className="profile-banner-info">
              <span className="profile-welcome-label">
                WELCOME TO MEALORA
              </span>
              <h2>{user.name || "Mealora User"}</h2>
              <p>{user.email || "Email not available"}</p>
            </div>
          </div>

          <div className="profile-member">
            <span className="member-dot"></span>
            Customer Account
          </div>
        </div>

        {/* ACCOUNT FEATURE CARDS */}
        <div className="profile-section-heading">
          <h2>Account Overview</h2>
          <p>Everything you need, in one place.</p>
        </div>

        <div className="profile-feature-grid">
          <Link href="/order-history" className="profile-feature-card">
            <div className="feature-icon">📦</div>
            <div>
              <h3>My Orders</h3>
              <p>View and track your orders</p>
            </div>
            <span className="feature-arrow">→</span>
          </Link>

          <button
            className="profile-feature-card"
            onClick={scrollToAddresses}
          >
            <div className="feature-icon">📍</div>
            <div>
              <h3>My Addresses</h3>
              <p>Manage your delivery addresses</p>
            </div>
            <span className="feature-arrow">→</span>
          </button>

          <button
            className="profile-feature-card"
            onClick={openEditProfile}
          >
            <div className="feature-icon">👤</div>
            <div>
              <h3>Personal Details</h3>
              <p>Update your personal information</p>
            </div>
            <span className="feature-arrow">→</span>
          </button>

          <button
            className="profile-feature-card"
            onClick={openPasswordModal}
          >
            <div className="feature-icon">🔒</div>
            <div>
              <h3>Security</h3>
              <p>Manage your account password</p>
            </div>
            <span className="feature-arrow">→</span>
          </button>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="profile-information-card">
          <div className="profile-information-heading">
            <div>
              <h2>Account Information</h2>
              <p>Your registered personal details</p>
            </div>

            <button
              className="profile-edit-button"
              onClick={openEditProfile}
            >
              ✎ Edit Profile
            </button>
          </div>

          <div className="profile-information-grid">
            <div className="profile-information-item">
              <label>FULL NAME</label>
              <p>{user.name || "Not available"}</p>
            </div>

            <div className="profile-information-item">
              <label>EMAIL ADDRESS</label>
              <p>{user.email || "Not available"}</p>
            </div>

            <div className="profile-information-item">
              <label>PHONE NUMBER</label>
              <p>{user.phone || "Not added"}</p>
            </div>

            <div className="profile-information-item">
              <label>ACCOUNT ID</label>
              <p>{user.id || "Not available"}</p>
            </div>
          </div>
        </div>

        {/* MY ADDRESSES SECTION */}
        <div className="address-section" id="my-addresses">
          <div className="address-section-heading">
            <div>
              <span className="address-eyebrow">DELIVERY DETAILS</span>
              <h2>My Addresses</h2>
              <p>Save and manage your delivery locations.</p>
            </div>

            <button
              type="button"
              className="address-add-button"
              onClick={openAddAddress}
            >
              + Add New Address
            </button>
          </div>

          {addressMessage && (
            <div className="address-success-message">
              {addressMessage}
            </div>
          )}

          {addressError && !showAddressModal && (
            <div className="address-error-message">
              {addressError}
            </div>
          )}

          {loadingAddresses ? (
            <div className="address-empty-state">
              Loading your addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="address-empty-state">
              <div className="address-empty-icon">📍</div>
              <h3>No saved addresses yet</h3>
              <p>
                Add your delivery address to make your next order easier.
              </p>
              <button
                type="button"
                className="address-add-button"
                onClick={openAddAddress}
              >
                + Add Your First Address
              </button>
            </div>
          ) : (
            <div className="address-grid">
              {addresses.map((address) => (
                <article className="address-card" key={address.id}>
                  <div className="address-card-top">
                    <div className="address-type">
                      <span>
                        {address.addressType === "Home"
                          ? "🏠"
                          : address.addressType === "Work"
                          ? "🏢"
                          : "📍"}
                      </span>
                      {address.addressType}
                    </div>

                    {address.defaultAddress && (
                      <span className="address-default-badge">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <h3>{address.fullName}</h3>
                  <p className="address-phone">📞 {address.phone}</p>

                  <p className="address-full-text">
                    {address.addressLine}
                    {address.landmark && (
                      <>
                        <br />
                        {address.landmark}
                      </>
                    )}
                    <br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>

                  <div className="address-card-actions">
                    <button
                      type="button"
                      className="address-action-edit"
                      onClick={() => openEditAddress(address)}
                    >
                      ✎ Edit
                    </button>

                    <button
                      type="button"
                      className="address-action-delete"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      Delete
                    </button>

                    {!address.defaultAddress && (
                      <button
                        type="button"
                        className="address-action-default"
                        onClick={() =>
                          handleSetDefaultAddress(address.id)
                        }
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="profile-bottom">
          <div>
            <h3>Hungry for something delicious?</h3>
            <p>
              Explore our menu and discover your next favourite meal.
            </p>
          </div>

          <Link href="/" className="profile-shop-button">
            Explore Menu →
          </Link>
        </div>

        <div className="profile-logout-row">
          <span>Want to leave your account?</span>
          <button onClick={handleLogout}>Logout ↗</button>
        </div>
      </section>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div
          className="edit-profile-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div
            className="edit-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="edit-profile-header">
              <div>
                <span>MEALORA ACCOUNT</span>
                <h2 id="edit-profile-title">Edit Profile</h2>
                <p>Update your personal information below.</p>
              </div>

              <button
                type="button"
                className="edit-profile-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {fetchingProfile ? (
              <div className="edit-profile-loading">
                Loading your details...
              </div>
            ) : (
              <form onSubmit={handleSaveProfile}>
                <div className="edit-profile-field">
                  <label htmlFor="edit-name">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="edit-profile-field">
                  <label htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="edit-profile-field">
                  <label htmlFor="edit-phone">Phone Number</label>
                  <input
                    id="edit-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={20}
                  />
                </div>

                {error && (
                  <div className="edit-profile-error">{error}</div>
                )}

                {message && (
                  <div className="edit-profile-success">{message}</div>
                )}

                <div className="edit-profile-actions">
                  <button
                    type="button"
                    className="edit-profile-cancel"
                    onClick={closeEditModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="edit-profile-save"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div
          className="edit-profile-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePasswordModal();
            }
          }}
        >
          <div
            className="edit-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            <div className="edit-profile-header">
              <div>
                <span>MEALORA SECURITY</span>
                <h2 id="change-password-title">Change Password</h2>
                <p>Keep your account safe with a strong password.</p>
              </div>

              <button
                type="button"
                className="edit-profile-close"
                onClick={closePasswordModal}
                disabled={changingPassword}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="edit-profile-field">
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  name="currentPassword"
                  placeholder="Enter your current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  name="newPassword"
                  placeholder="Enter your new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  required
                />
              </div>

              <p className="password-hint">
                Your new password must contain at least 8 characters.
              </p>

              {passwordError && (
                <div className="edit-profile-error">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="edit-profile-success">
                  {passwordMessage}
                </div>
              )}

              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="edit-profile-cancel"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-profile-save"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div
          className="edit-profile-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddressModal();
            }
          }}
        >
          <div
            className="edit-profile-modal address-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
          >
            <div className="edit-profile-header">
              <div>
                <span>MEALORA DELIVERY</span>
                <h2 id="address-modal-title">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h2>
                <p>Enter your delivery address details.</p>
              </div>

              <button
                type="button"
                className="edit-profile-close"
                onClick={closeAddressModal}
                disabled={savingAddress}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAddress}>
              <div className="edit-profile-field">
                <label htmlFor="address-fullName">Full Name</label>
                <input
                  id="address-fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter recipient name"
                  value={addressForm.fullName}
                  onChange={handleAddressInputChange}
                  maxLength={50}
                  required
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="address-phone">Phone Number</label>
                <input
                  id="address-phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={addressForm.phone}
                  onChange={handleAddressInputChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="address-addressLine">Address</label>
                <textarea
                  id="address-addressLine"
                  name="addressLine"
                  placeholder="House number, building, street, area"
                  value={addressForm.addressLine}
                  onChange={handleAddressInputChange}
                  maxLength={255}
                  rows={3}
                  required
                />
              </div>

              <div className="address-form-row">
                <div className="edit-profile-field">
                  <label htmlFor="address-city">City</label>
                  <input
                    id="address-city"
                    name="city"
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={handleAddressInputChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="edit-profile-field">
                  <label htmlFor="address-state">State</label>
                  <input
                    id="address-state"
                    name="state"
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={handleAddressInputChange}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className="address-form-row">
                <div className="edit-profile-field">
                  <label htmlFor="address-pincode">Pincode</label>
                  <input
                    id="address-pincode"
                    name="pincode"
                    type="text"
                    placeholder="6-digit pincode"
                    value={addressForm.pincode}
                    onChange={handleAddressInputChange}
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="edit-profile-field">
                  <label htmlFor="address-landmark">Landmark (Optional)</label>
                  <input
                    id="address-landmark"
                    name="landmark"
                    type="text"
                    placeholder="Nearby landmark"
                    value={addressForm.landmark}
                    onChange={handleAddressInputChange}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="edit-profile-field">
                <label htmlFor="address-addressType">Address Type</label>
                <select
                  id="address-addressType"
                  name="addressType"
                  value={addressForm.addressType}
                  onChange={handleAddressInputChange}
                  required
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <label className="address-default-checkbox">
                <input
                  type="checkbox"
                  name="defaultAddress"
                  checked={addressForm.defaultAddress}
                  onChange={handleAddressInputChange}
                />
                Set as default delivery address
              </label>

              {addressError && (
                <div className="edit-profile-error">{addressError}</div>
              )}

              {addressMessage && (
                <div className="edit-profile-success">
                  {addressMessage}
                </div>
              )}

              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="edit-profile-cancel"
                  onClick={closeAddressModal}
                  disabled={savingAddress}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-profile-save"
                  disabled={savingAddress}
                >
                  {savingAddress
                    ? "Saving..."
                    : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="profile-footer">
        © 2026 Mealora. Made with care for food lovers.
      </footer>
    </main>
  );
}
