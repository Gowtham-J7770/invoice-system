import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Package,
  Truck,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function Sidebar() {

  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");
  };

  const linkClass = (path) =>
    `block px-4 py-3 rounded-xl transition ${
      location.pathname === path
        ? "bg-white text-black font-medium shadow"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (

    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col justify-between p-5">

      {/* TOP */}

      <div>

        {/* LOGO */}

        <div className="flex justify-center items-center mb-10">

          <img
            src="/logo.png"
            alt="logo"
            className="h-12 object-contain"
          />

        </div>

        {/* NAVIGATION */}

        <nav className="flex flex-col gap-3">

          {/* DASHBOARD */}

          <Link
            to="/dashboard"
            className={linkClass("/dashboard")}
          >

            <div className="flex items-center gap-3">

              <LayoutDashboard size={18} />

              Dashboard

            </div>

          </Link>

          {/* CLIENTS */}

          <Link
            to="/clients"
            className={linkClass("/clients")}
          >

            <div className="flex items-center gap-3">

              <Users size={18} />

              Clients

            </div>

          </Link>

          {/* PRODUCTS */}

          <Link
            to="/products"
            className={linkClass("/products")}
          >

            <div className="flex items-center gap-3">

              <Package size={18} />

              Products

            </div>

          </Link>

          {/* SUPPLIERS */}

          <Link
            to="/suppliers"
            className={linkClass("/suppliers")}
          >

            <div className="flex items-center gap-3">

              <Truck size={18} />

              Suppliers

            </div>

          </Link>

          {/* INVOICES */}

          <Link
            to="/invoices"
            className={linkClass("/invoices")}
          >

            <div className="flex items-center gap-3">

              <FileText size={18} />

              Invoices

            </div>

          </Link>

        </nav>

      </div>

      {/* LOGOUT */}

      <div className="border-t border-gray-700 pt-4">

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Sidebar;