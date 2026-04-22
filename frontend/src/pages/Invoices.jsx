import { useEffect, useState } from "react";
import axios from "axios";

function Invoices() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 TEMP INPUT (TOP SECTION)
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);

  const hasInventory = true;

  // 🔥 FETCH DATA
  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    const res = await axios.get("http://localhost/backend/get_clients.php");
    setClients(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost/backend/get_products.php");
    setProducts(res.data);
  };

  // 🔥 ADD ITEM BUTTON
  const handleAddItem = () => {
    if (!selectedProduct) return alert("Select product");

    // 🚫 CHECK DUPLICATE
    const exists = items.find((i) => i.name === selectedProduct);

    if (exists) {
      alert("⚠️ Product already added. Edit quantity instead.");
      return;
    }

    const product = products.find((p) => p.name === selectedProduct);

    if (hasInventory && product.stock !== null) {
      if (qty > product.stock) {
        alert("❌ Not enough stock!");
        return;
      }
    }

    const newItem = {
      name: product.name,
      quantity: qty,
      price: Number(product.price),
      total: Number(product.price) * qty,
      stock: product.stock,
    };

    setItems([...items, newItem]);

    setSelectedProduct("");
    setQty(1);
  };

  // 🔥 TOTAL
  const grandTotal = items.reduce((sum, i) => sum + i.total, 0);

  // 🔥 SEND INVOICE
  const sendInvoice = async () => {
    if (!selectedClient) return alert("Select client");
    if (items.length === 0) return alert("Add items");

    try {
      setLoading(true); // 🔥 START LOADING

      const res = await axios.post(
        "http://localhost/backend/send_invoice.php",
        {
          client_id: selectedClient,
          items,
          total: grandTotal,
          hasInventory,
        },
      );

      if (res.data.error) {
        alert(res.data.error);
        return;
      }

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2000); // 0.6 sec

      setItems([]);
      setSelectedClient("");

      fetchProducts(); // 🔥 refresh stock
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // 🔥 STOP LOADING
    }
  };

  return (
    <div
      className={`relative flex gap-6 p-6 bg-gray-100 min-h-screen ${loading ? "cursor-not-allowed" : ""}`}
    >
      {/* 🔥 LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded shadow flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Sending Invoice...</span>
          </div>
        </div>
      )}

      {/* 🔥 TOAST (ADD HERE) */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white shadow-xl rounded-lg px-6 py-3 flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
            ✔
          </div>

          <span className="text-sm font-medium">Invoice Sent</span>
        </div>
      )}

      {/* LEFT SIDE */}
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Create Invoice</h2>

        {/* CLIENT */}
        <div className="bg-white p-4 rounded shadow mb-4 flex gap-2 items-end">
          <div className="flex flex-col w-1/2">
            <label className="text-sm mb-1">Client</label>
            <select
              className="mb-4 p-2 border rounded w-full"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔥 PRODUCT ADD BAR */}
        <div className="bg-white p-4 rounded shadow mb-4 flex gap-3 items-end">
          {/* PRODUCT */}
          <div className="flex flex-col w-1/2">
            <label className="text-sm mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select Product</option>

              {products.map((p) => {
                const alreadyAdded = items.some((i) => i.name === p.name);

                return (
                  <option key={p.id} value={p.name} disabled={alreadyAdded}>
                    {p.name}
                    {p.stock !== null ? ` (Stock: ${p.stock})` : ""}
                    {alreadyAdded ? " (Added)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* QTY */}
          <div className="flex flex-col w-1/4">
            <label className="text-sm mb-1">Qty</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="p-2 border rounded"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleAddItem}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* 🔥 ITEMS TABLE */}
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="text-center border-t">
                  <td className="p-2">{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹ {item.price}</td>
                  <td className="font-semibold">₹ {item.total}</td>

                  {/* 🔥 DELETE BUTTON */}
                  <td>
                    <button
                      onClick={() => {
                        const updated = items.filter((_, index) => index !== i);
                        setItems(updated);
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right mt-4 font-bold text-lg">
            Total: ₹ {grandTotal}
          </div>

          <button
            onClick={sendInvoice}
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
            }`}
          >
            {loading ? "⏳ Sending..." : "Save & Send Invoice"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE (PREVIEW) */}
      <div className="w-1/2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Invoice</h2>

        <p className="mb-2">
          <strong>Client:</strong>{" "}
          {clients.find((c) => c.id == selectedClient)?.name || "Select Client"}
        </p>

        <table className="w-full text-sm border mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{item.name}</td>
                <td className="border">{item.quantity}</td>
                <td className="border">₹ {item.price}</td>
                <td className="border font-semibold">₹ {item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4 font-bold text-lg">
          Total: ₹ {grandTotal}
        </div>
      </div>
    </div>
  );
}

export default Invoices;
