import { useEffect, useState } from "react";

import axios from "axios";

import {
  IndianRupee,
  FileText,
  Users,
  Package,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

import ProcurementModal from "../components/layout/ProcurementModal";

import { useProcurement } from "../context/ProcurementContext";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const { cart, notifiedProducts } = useProcurement();

  //////////////////////////////////////////////////
  // KPI STATS
  //////////////////////////////////////////////////

  const [stats, setStats] = useState({
    revenue: 0,
    invoices: 0,
    clients: 0,
    products: 0,
  });

  //////////////////////////////////////////////////
  // RECENT INVOICES
  //////////////////////////////////////////////////

  const [invoices, setInvoices] = useState([]);

  //////////////////////////////////////////////////
  // SELECTED INVOICE
  //////////////////////////////////////////////////

  const [selected, setSelected] = useState(null);

  //////////////////////////////////////////////////
  // PROCUREMENT MODAL
  //////////////////////////////////////////////////

  const [modalProduct, setModalProduct] = useState(null);

  //////////////////////////////////////////////////
  // LOW STOCK
  //////////////////////////////////////////////////

  const [lowStockWithSuppliers, setLowStockWithSuppliers] = useState([]);

  const [lowStockWithoutSuppliers, setLowStockWithoutSuppliers] = useState([]);

  //////////////////////////////////////////////////
  // LOAD
  //////////////////////////////////////////////////

  useEffect(() => {
    fetchStats();

    fetchInvoices();

    fetchLowStockProducts();
  }, []);

  //////////////////////////////////////////////////
  // FETCH DASHBOARD STATS
  //////////////////////////////////////////////////

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `http://localhost/backend/dashboard.php?user_id=${user.id}`,
      );

      setStats({
        revenue: Number(res.data?.revenue) || 0,

        invoices: Number(res.data?.invoices) || 0,

        clients: Number(res.data?.clients) || 0,

        products: Number(res.data?.products) || 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // FETCH RECENT INVOICES
  //////////////////////////////////////////////////

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(
        `http://localhost/backend/get_recent_invoices.php?user_id=${user.id}`,
      );

      setInvoices(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // FETCH LOW STOCK PRODUCTS
  //////////////////////////////////////////////////

  const fetchLowStockProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost/backend/get_low_stock_products.php?user_id=${user.id}`,
      );

      const products = res.data || [];

      setLowStockWithSuppliers(
        products.filter((p) => Number(p.supplier_count) > 0),
      );

      setLowStockWithoutSuppliers(
        products.filter((p) => Number(p.supplier_count) === 0),
      );
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // VIEW INVOICE
  //////////////////////////////////////////////////

  const viewInvoice = async (id) => {
    try {
      const res = await axios.post(
        "http://localhost/backend/get_invoice_details.php",
        {
          id,

          user_id: user.id,
        },
      );

      setSelected(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI CARDS */}

      <div className="grid grid-cols-2 gap-5 mb-8">
        {/* REVENUE */}

        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between h-[160px]">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>

            <h2 className="text-3xl font-bold text-green-600 mt-1">
              ₹ {stats.revenue.toFixed(2)}
            </h2>
          </div>

          <div className="bg-green-100 p-3 rounded-lg">
            <IndianRupee className="text-green-600" size={26} />
          </div>
        </div>

        {/* INVOICES */}

        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between h-[160px]">
          <div>
            <p className="text-gray-500 text-sm">Invoices</p>

            <h2 className="text-3xl font-bold text-purple-600 mt-1">
              {stats.invoices}
            </h2>
          </div>

          <div className="bg-purple-100 p-3 rounded-lg">
            <FileText className="text-purple-600" size={26} />
          </div>
        </div>

        {/* CLIENTS */}

        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between h-[160px]">
          <div>
            <p className="text-gray-500 text-sm">Clients</p>

            <h2 className="text-3xl font-bold text-blue-600 mt-1">
              {stats.clients}
            </h2>
          </div>

          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="text-blue-600" size={26} />
          </div>
        </div>

        {/* PRODUCTS */}

        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between h-[160px]">
          <div>
            <p className="text-gray-500 text-sm">Products</p>

            <h2 className="text-3xl font-bold text-orange-600 mt-1">
              {stats.products}
            </h2>
          </div>

          <div className="bg-orange-100 p-3 rounded-lg">
            <Package className="text-orange-600" size={26} />
          </div>
        </div>
      </div>

      {/* LOW STOCK */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* WITHOUT SUPPLIERS */}

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={18} />
            Low Stock (No Suppliers)
          </h2>

          {lowStockWithoutSuppliers.length === 0 ? (
            <p className="text-gray-400 text-sm">No products</p>
          ) : (
            lowStockWithoutSuppliers.map((product) => (
              <div key={product.id} className="border rounded-lg p-3 mb-3">
                <p className="font-medium">{product.name}</p>

                <p className="text-sm text-gray-500 mt-1">
                  Stock: {product.stock}
                </p>

                <p className="text-sm text-red-500 mt-1">No suppliers linked</p>
              </div>
            ))
          )}
        </div>

        {/* WITH SUPPLIERS */}

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="text-green-600" size={18} />
            Restock Products
          </h2>

          {lowStockWithSuppliers.length === 0 ? (
            <p className="text-gray-400 text-sm">No products</p>
          ) : (
            lowStockWithSuppliers.map((product) => {
              const inCart = cart.some(
                (item) => String(item.product_id) === String(product.id),
              );

              return (
                <div key={product.id} className="border rounded-lg p-3 mb-3">
                  <p className="font-medium">{product.name}</p>

                  <p className="text-sm text-gray-500 mt-1">
                    Stock: {product.stock}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Suppliers: {product.supplier_count}
                  </p>

                  {notifiedProducts.some(
                    (id) => String(id) === String(product.id),
                  ) ? (
                    <div className="mt-3 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                      Supplier Notified
                    </div>
                  ) : inCart ? (
                    <div className="mt-3 inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                      Added To Cart
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalProduct(product)}
                      className="mt-3 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                    >
                      Order Now
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RECENT INVOICES */}

      <div className="flex gap-5">
        {/* LEFT */}

        <div className="w-[60%] bg-white rounded-xl shadow p-4">
          <h2 className="font-bold mb-4">Recent Invoices</h2>

          {invoices.length === 0 ? (
            <p className="text-gray-500">No invoices found</p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="flex justify-between border-b py-3">
                <div>
                  <p className="font-medium">{inv.invoice_number}</p>

                  <p className="text-sm text-gray-500">{inv.client_name}</p>

                  <p className="text-xs text-gray-400">
                    {new Date(inv.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p>₹ {inv.total}</p>

                  <button
                    onClick={() => viewInvoice(inv.id)}
                    className="text-blue-600 text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}

        <div className="w-[40%] bg-white rounded-xl shadow p-4">
          <h2 className="font-bold mb-4">Invoice Details</h2>

          {!selected ? (
            <p className="text-gray-500">Select an invoice</p>
          ) : (
            <>
              <p className="font-bold">{selected.invoice.invoice_number}</p>

              <p className="text-sm text-gray-500 mb-3">
                {selected.invoice.client_name}
              </p>

              {selected.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{item.product_name}</span>

                  <span>
                    {item.quantity} × ₹{item.price}
                  </span>
                </div>
              ))}

              <div className="mt-3 text-right font-bold">
                ₹ {selected.invoice.total}
              </div>
            </>
          )}
        </div>
      </div>

      {/* PROCUREMENT MODAL */}

      {modalProduct && (
        <ProcurementModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
