import { useEffect, useState } from "react";
import axios from "axios";

function Invoices() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product selection
  const [selectedProduct, setSelectedProduct] = useState("");

  // Quantity can be decimal (0.5, 1.25)
  const [qty, setQty] = useState(1);

  //////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    const res = await axios.get(
      `http://localhost/backend/get_clients.php?user_id=${user.id}`,
    );

    setClients(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get(
      `http://localhost/backend/get_products.php?user_id=${user.id}`,
    );

    setProducts(res.data);
  };

  //////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////

  const formatProductName = (product) => {
    return [product.name, product.variant, product.brand]
      .filter(Boolean)
      .join(" - ");
  };

  const getSelectedProduct = () => {
    return products.find((p) => String(p.id) === String(selectedProduct));
  };

  //////////////////////////////////////////////////
  // ADD ITEM
  //////////////////////////////////////////////////

  const handleAddItem = () => {
    if (!selectedClient) {
      alert("Select client first");
      return;
    }

    if (!selectedProduct) {
      alert("Select product");
      return;
    }

    const product = getSelectedProduct();

    if (!product) {
      alert("Product not found");
      return;
    }

    const quantity = Number(qty);

    if (product.inventory_type === "standard" && !Number.isInteger(quantity)) {
      alert("Standard products must use whole number quantities");
      return;
    }

    if (quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    // Prevent duplicate same product
    const exists = items.find(
      (item) => String(item.product_id) === String(product.id),
    );

    if (exists) {
      alert("Product already added");
      return;
    }

    // Stock validation
    if (quantity > Number(product.stock)) {
      alert("Not enough stock");
      return;
    }

    let itemPrice = 0;

    //////////////////////////////////////////////////
    // STANDARD PRODUCT
    //////////////////////////////////////////////////

    if (product.inventory_type === "standard") {
      itemPrice = Number(product.price);
    }

    //////////////////////////////////////////////////
    // MEASURABLE PRODUCT
    //////////////////////////////////////////////////
    else {
      // Check preset match
      const preset = product.selling_options?.find(
        (option) => Number(option.quantity) === quantity,
      );

      if (preset) {
        // Preset overrides auto calculation
        itemPrice = Number(preset.price);
      } else {
        // quantity × price per kg/L
        itemPrice = Number(product.price) * quantity;
      }
    }

    const newItem = {
      product_id: product.id,
      name: formatProductName(product),
      quantity,
      price: itemPrice,
      total: itemPrice,
      stock: Number(product.stock),
      inventory_type: product.inventory_type,
      base_unit: product.base_unit,
    };

    setItems([...items, newItem]);

    setSelectedProduct("");
    setQty(1);
  };

  //////////////////////////////////////////////////
  // REMOVE ITEM
  //////////////////////////////////////////////////

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  //////////////////////////////////////////////////
  // TOTAL
  //////////////////////////////////////////////////

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total), 0);

  //////////////////////////////////////////////////
  // SEND INVOICE
  //////////////////////////////////////////////////

  const sendInvoice = async () => {
    if (!selectedClient) {
      alert("Select client");
      return;
    }

    if (items.length === 0) {
      alert("Add items");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost/backend/send_invoice.php",
        {
          user_id: user.id,
          client_id: selectedClient,
          items,
          total: grandTotal,
        },
      );

      if (res.data.error) {
        alert(res.data.error);
        return;
      }

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2000);

      setItems([]);
      setSelectedClient("");
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedClientData = clients.find(
    (client) => String(client.id) === String(selectedClient),
  );

  const today = new Date().toLocaleDateString("en-IN");

  const previewInvoiceNumber = "INV-Preview";

  const subtotal = grandTotal;
  const discount = 0;
  const gstRate = 0;
  const gstAmount = ((subtotal - discount) * gstRate) / 100;
  const finalTotal = subtotal - discount + gstAmount;

  return (
    <div
      className={`relative flex gap-6 p-6 bg-gray-100 min-h-screen ${
        loading ? "cursor-not-allowed" : ""
      }`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded shadow flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Sending Invoice...</span>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white shadow-xl rounded-lg px-6 py-3 flex items-center gap-3 z-50">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
            ✔
          </div>
          <span className="text-sm font-medium">Invoice Sent</span>
        </div>
      )}

      {/* LEFT SIDE */}
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Create Invoice</h2>

        {/* Client Selection */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <label className="text-sm mb-1 block">Client</label>

          <select
            className="p-2 border rounded w-full"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Select Client</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div className="bg-white p-4 rounded shadow mb-4 flex gap-3 items-end">
          {/* Product */}
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-sm mb-1">Product</label>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="p-2 border rounded w-full min-h-[42px]"
            >
              <option value="">Select Product</option>

              {products.map((product) => {
                const alreadyAdded = items.some(
                  (item) => String(item.product_id) === String(product.id),
                );

                return (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={alreadyAdded}
                  >
                    {formatProductName(product).length > 40
                      ? formatProductName(product).slice(0, 40) + "..."
                      : formatProductName(product)}{" "}
                    ({product.stock}
                    {product.inventory_type === "measurable"
                      ? ` ${product.base_unit}`
                      : " pcs"}
                    ){alreadyAdded ? " (Added)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity */}
          <div className="flex flex-col w-1/4">
            <label className="text-sm mb-1">Qty</label>

            <input
              type="number"
              step={
                getSelectedProduct()?.inventory_type === "measurable"
                  ? "0.01"
                  : "1"
              }
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="p-2 border rounded"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddItem}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* Items Table */}
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">Total</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="p-2">{item.name}</td>

                  <td className="p-2">
                    {item.quantity}
                    {item.inventory_type === "measurable" && item.base_unit
                      ? ` ${item.base_unit}`
                      : ""}
                  </td>

                  <td className="p-2">₹ {Number(item.price).toFixed(2)}</td>

                  <td className="p-2 font-semibold">
                    ₹ {Number(item.total).toFixed(2)}
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => removeItem(index)}
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
            Total: ₹ {grandTotal.toFixed(2)}
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

      {/* RIGHT SIDE - INVOICE PREVIEW */}
      {/* RIGHT SIDE - INVOICE PREVIEW */}
      <div className="w-1/2 bg-white p-6 rounded shadow">
        {/* Header */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            {/* Shop Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.shop_name || "Your Shop Name"}
              </h2>

              <p className="text-sm text-gray-600">
                {user.address || "Shop Address"}
              </p>

              <p className="text-sm text-gray-600">
                {user.phone || "Phone Number"}
              </p>
            </div>

            {/* Invoice Title */}
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>

              <p className="text-sm text-gray-600">INV-Preview</p>
            </div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Invoice Number</p>
            <p className="font-medium">INV-Preview</p>
          </div>

          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Bill To</p>

          {(() => {
            const client = clients.find(
              (c) => String(c.id) === String(selectedClient),
            );

            return (
              <>
                <p className="font-semibold">
                  {client?.name || "Select Client"}
                </p>

                {client?.email && (
                  <p className="text-sm text-gray-600">{client.email}</p>
                )}

                {client?.phone && (
                  <p className="text-sm text-gray-600">{client.phone}</p>
                )}
              </>
            );
          })()}
        </div>

        {/* Items Table */}
        <table className="w-full text-sm border mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">Item</th>
              <th className="p-2 border text-center">Qty</th>
              <th className="p-2 border text-right">Price</th>
              <th className="p-2 border text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.name}</td>

                <td className="border p-2 text-center">
                  {item.quantity}
                  {item.inventory_type === "measurable" && item.base_unit
                    ? ` ${item.base_unit}`
                    : ""}
                </td>

                <td className="border p-2 text-right">
                  ₹ {Number(item.price).toFixed(2)}
                </td>

                <td className="border p-2 text-right font-medium">
                  ₹ {Number(item.total).toFixed(2)}
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="border p-4 text-center text-gray-500"
                >
                  No items added.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total Breakdown */}
        <div className="mt-6 border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Discount</span>
            <span>₹ 0.00</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>GST (0%)</span>
            <span>₹ 0.00</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-2xl font-bold text-gray-900">
            <span>Grand Total</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          Thank you for your business!
        </div>
      </div>
    </div>
  );
}

export default Invoices;
