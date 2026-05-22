import Sidebar from "./Sidebar";

import {
  ShoppingCart,
} from "lucide-react";

import {
  useProcurement,
} from "../../context/ProcurementContext";

function Layout({ children }) {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const {
    cart,
  } = useProcurement();

  return (

    <div className="flex h-screen">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}

        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

          {/* LEFT SHOP PROFILE */}

          <button
            onClick={() =>
              (
                window.location.href =
                  "/profile"
              )
            }
            className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
          >

            {/* AVATAR */}

            <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-lg">

              {user?.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

            {/* SHOP INFO */}

            <div className="text-left">

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">

                {user?.shop_name}

              </h1>

              <p className="text-sm text-gray-500">

                @{user?.name}

              </p>

            </div>

          </button>

          {/* RIGHT PROCUREMENT */}

          <div className="flex items-center gap-4">

            {/* PROCUREMENT STATUS */}

            <button
              onClick={() =>
                (
                  window.location.href =
                    "/procurement"
                )
              }
              className="flex items-center gap-4 bg-gray-900 text-white px-5 py-3 rounded-2xl hover:bg-black transition shadow"
            >

              {/* ICON */}

              <div className="relative">

                <ShoppingCart
                  size={24}
                />

                {/* COUNT */}

                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">

                  {cart.length}

                </span>

              </div>

              {/* TEXT */}

              <div className="text-left">

                <p className="font-semibold text-sm">

                  Suppliers Cart

                </p>

                <p className="text-xs text-gray-300">

                  {cart.length === 0
                    ? "No pending orders"
                    : `${cart.length} item${cart.length > 1 ? "s" : ""} pending`}

                </p>

              </div>

            </button>

          </div>

        </div>

        {/* CONTENT */}

        <div className="flex-1 p-6 bg-gray-100 overflow-auto">

          {children}

        </div>

      </div>

    </div>
  );
}

export default Layout;