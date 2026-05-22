import { useState } from "react";

import axios from "axios";

function Profile() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    id: currentUser.id,
    name: currentUser.name || "",
    email: currentUser.email || "",
    shop_name: currentUser.shop_name || "",
    address: currentUser.address || "",
    phone: currentUser.phone || "",
    password: "",
    confirmPassword: "",
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // INPUT CHANGE

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SAVE

  const handleSubmit = async () => {
    setMessage("");

    // NAME VALIDATION
    if (!form.name.trim()) {
      setMessage("Name cannot be blank");
      return;
    }

    // SHOP NAME VALIDATION
    if (!form.shop_name.trim()) {
      setMessage("Shop name cannot be blank");
      return;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      setMessage("Enter a valid email address");
      return;
    }

    // PHONE VALIDATION (10 digits)
    const phoneRegex = /^\d{10}$/;

    if (form.phone && !phoneRegex.test(form.phone)) {
      setMessage("Phone number must contain exactly 10 digits");
      return;
    }

    // PASSWORD VALIDATION
    if (showPasswordFields) {
      // Current password required
      if (!form.currentPassword?.trim()) {
        setMessage("Enter your current password");
        return;
      }

      // New password required
      if (!form.password.trim()) {
        setMessage("Enter a new password");
        return;
      }

      // Confirm password required
      if (!form.confirmPassword.trim()) {
        setMessage("Confirm your new password");
        return;
      }

      // Password match
      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }

      // Strong password:
      // Minimum 8 characters
      // At least 1 uppercase letter
      // At least 1 lowercase letter
      // At least 1 number
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      if (!passwordRegex.test(form.password)) {
        setMessage(
          "New password must be at least 8 characters and include uppercase, lowercase, and a number",
        );
        return;
      }
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost/backend/update_profile.php",
        form,
      );

      if (res.data.error) {
        setMessage(res.data.error);

        return;
      }

      // UPDATE LOCAL STORAGE

      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Profile updated successfully");

      // CLEAR PASSWORDS

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setShowPasswordFields(false);
    } catch (err) {
      console.log(err);

      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
      {/* HEADER */}

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>

          <p className="text-gray-500 mt-1">Manage your account information</p>
        </div>

        {/* PROFILE ICON */}

        <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold">
          {currentUser?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* ACCOUNT INFO */}

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500">Account Created</p>

        <p className="font-medium">
          {currentUser?.created_at
            ? new Date(currentUser.created_at).toLocaleString()
            : "Unknown"}
        </p>

        <p className="text-sm text-gray-500 mt-3">Last Updated</p>

        <p className="font-medium">
          {currentUser?.updated_at
            ? new Date(currentUser.updated_at).toLocaleString()
            : "Never"}
        </p>
      </div>

      {/* FORM */}

      <div className="grid grid-cols-2 gap-5">
        {/* NAME */}

        <div>
          <label className="text-sm text-gray-600 block mb-1">Name</label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* EMAIL */}

        <div>
          <label className="text-sm text-gray-600 block mb-1">Email</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* SHOP NAME */}

        <div>
          <label className="text-sm text-gray-600 block mb-1">Shop Name</label>

          <input
            type="text"
            name="shop_name"
            value={form.shop_name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* PHONE */}

        <div>
          <label className="text-sm text-gray-600 block mb-1">Phone</label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Add phone number"
            className="w-full border p-3 rounded"
          />
        </div>
      </div>

      {/* ADDRESS */}

      <div className="mt-5">
        <label className="text-sm text-gray-600 block mb-1">Address</label>

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Add address"
          rows={4}
          className="w-full border p-3 rounded"
        />
      </div>

      {/* PASSWORD SECTION */}

      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Password</h2>

            <p className="text-sm text-gray-500">
              Last changed:{" "}
              {currentUser?.password_updated_at
                ? new Date(currentUser.password_updated_at).toLocaleString()
                : "Never"}
            </p>
          </div>

          {!showPasswordFields && (
            <button
              onClick={() => setShowPasswordFields(true)}
              className="text-blue-600 hover:underline"
            >
              Change Password
            </button>
          )}
        </div>

        {/* PASSWORD FORM */}

        {showPasswordFields && (
          <div className="grid grid-cols-3 gap-5">
            {/* CURRENT PASSWORD */}

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword || ""}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />
            </div>

            {/* NEW PASSWORD */}

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                New Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />
            </div>

            {/* CONFIRM */}

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* SAVE BUTTON */}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-8 bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {/* MESSAGE */}

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}

export default Profile;
