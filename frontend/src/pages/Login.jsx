import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      const res = await api.post(
        "auth/login.php",
        form
      );

      if (res.data.success) {
        login(
          res.data.user,
          res.data.token
        );

        navigate("/dashboard");
      } else {
        setError(
          res.data.message ||
            "Invalid credentials"
        );
      }
    } catch (err) {
      console.log(err);
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex bg-[#08152f] text-white p-12 flex-col justify-between">
          <div>
            <img
              src="/logo.png"
              alt="ShopDesk"
              className="h-16 object-contain mb-8"
            />

            <h1 className="text-4xl font-bold leading-tight mb-4">
              Smart Billing for
              <br />
              Modern Retail Stores
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed">
              Manage products, invoices,
              customer accounts, and
              inventory from one
              beautiful dashboard.
            </p>
          </div>

          <div className="space-y-3 text-sm text-blue-100">
            <p>
              ✅ Inventory Management
            </p>
            <p>
              ✅ Invoice Generation
            </p>
            <p>
              ✅ Customer Kaatha
            </p>
            <p>
              ✅ Email PDF Invoices
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="/logo.png"
                alt="ShopDesk"
                className="h-14 object-contain"
              />
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome Back 👋
              </h2>

              <p className="text-gray-500 mt-2">
                Sign in to access your
                ShopDesk dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#08152f] hover:bg-[#0b1d42] text-white p-3 rounded-xl font-semibold transition duration-200 shadow"
              >
                Sign In
              </button>

              {/* Register Link */}
              <p className="text-center text-gray-600 text-sm pt-2">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;