import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    shop_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // NAME VALIDATION
    if (!form.name.trim()) {
      setError("Name cannot be blank");
      return;
    }

    // SHOP NAME VALIDATION
    if (!form.shop_name.trim()) {
      setError("Shop name cannot be blank");
      return;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      setError("Enter a valid email address");
      return;
    }

    // PHONE VALIDATION (required, exactly 10 digits)
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(form.phone)) {
      setError("Phone number must contain exactly 10 digits");
      return;
    }

    // PASSWORD VALIDATION
    // Minimum 8 characters
    // At least 1 uppercase letter
    // At least 1 lowercase letter
    // At least 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      );
      return;
    }

    try {
      const res = await api.post("auth/register.php", form);

      if (res.data.success) {
        navigate("/login");
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.log(err);
      setError("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex bg-[#08152f] text-white p-12 flex-col justify-between">
          <div>
            <img
              src="/logo.png"
              alt="ShopDesk"
              className="h-16 object-contain mb-8"
            />

            <h1 className="text-4xl font-bold leading-tight mb-4">
              Start Managing
              <br />
              Your Store Smarter
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed">
              Create your account and get instant access to billing, inventory,
              customer accounts, and business insights.
            </p>
          </div>

          <div className="space-y-4 text-sm text-blue-100">
            <p>📦 Product Management</p>
            <p>🧾 Professional Invoices</p>
            <p>👥 Customer Kaatha</p>
            <p>📊 Business Dashboard</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 sm:p-10 overflow-y-auto max-h-screen">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="/logo.png"
                alt="ShopDesk"
                className="h-14 object-contain"
              />
            </div>

            {/* Header */}
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">
                Create Account 🚀
              </h2>

              <p className="text-gray-500 mt-2">
                Set up your store in just a few steps.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="text"
                name="shop_name"
                placeholder="Shop Name"
                value={form.shop_name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <textarea
                name="address"
                placeholder="Shop Address"
                rows="3"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#08152f] hover:bg-[#0b1d42] text-white p-3 rounded-xl font-semibold transition duration-200 shadow"
              >
                Create Account
              </button>

              {/* Login Link */}
              <p className="text-center text-gray-600 text-sm pt-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
