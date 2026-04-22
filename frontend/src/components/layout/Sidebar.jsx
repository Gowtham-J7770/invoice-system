import { LayoutDashboard, Users, FileText, LogOut, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const linkClass = (path) =>
    `block px-4 py-2 rounded ${
      location.pathname === path
        ? "bg-gray-700 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col justify-between p-5">
      {/* 🔥 TOP */}
      <div>
        <div className="flex justify-center items-center mb-8">
          <img src="/logo.png" alt="logo" className="h-12 object-contain" />
        </div>

        <nav className="flex flex-col gap-3">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            <div className="flex items-center gap-2">
              <LayoutDashboard size={18} />
              Dashboard
            </div>
          </Link>

          <Link to="/clients" className={linkClass("/clients")}>
            <div className="flex items-center gap-2">
              <Users size={18} />
              Clients
            </div>
          </Link>

          <Link to="/products" className={linkClass("/products")}>
            <div className="flex items-center gap-2">
              <Package size={18} />
              Products
            </div>
          </Link>

          <Link to="/invoices" className={linkClass("/invoices")}>
            <div className="flex items-center gap-2">
              <FileText size={18} />
              Invoices
            </div>
          </Link>
        </nav>
      </div>

      {/* 💀 BOTTOM (PROFILE) */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400 mb-2">My Shop</p>

        <button className="flex items-center gap-2 text-red-400 hover:text-red-600">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
