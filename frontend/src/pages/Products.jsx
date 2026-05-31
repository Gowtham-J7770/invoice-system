import { useState, useEffect } from "react";
import axios from "axios";
import ProcurementModal from "../components/layout/ProcurementModal";
import { useProcurement } from "../context/ProcurementContext";

function Products() {
  const user = JSON.parse(localStorage.getItem("user"));
  //////////////////////////////////////////////////
  // PROCUREMENT CART
  //////////////////////////////////////////////////

  const { cart } = useProcurement();

  //////////////////////////////////////////////////
  // EMPTY FORM
  //////////////////////////////////////////////////

  const emptyForm = {
    name: "",
    variant: "",
    brand: "",
    inventory_type: "standard",
    base_unit: "",
    price: "",
    stock: "",
    low_stock_limit: 5,
    selling_options: [],
  };

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [modalProduct, setModalProduct] = useState(null);

  const [restockProduct, setRestockProduct] = useState(null);

  const [restockQuantity, setRestockQuantity] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost/backend/get_products.php?user_id=${user.id}`,
      );
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "inventory_type" && value === "standard") {
        updated.base_unit = "";
        updated.selling_options = [];
      }

      return updated;
    });
  };

  const addSellingOption = () => {
    setForm((prev) => ({
      ...prev,
      selling_options: [
        ...prev.selling_options,
        {
          label: "",
          quantity: "",
          price: "",
        },
      ],
    }));
  };

  const removeSellingOption = (index) => {
    setForm((prev) => ({
      ...prev,
      selling_options: prev.selling_options.filter((_, i) => i !== index),
    }));
  };

  const handleSellingOptionChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      selling_options: prev.selling_options.map((option, i) =>
        i === index
          ? {
              ...option,
              [field]: value,
            }
          : option,
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setSubmitError("Product name is required");
      return;
    }

    if (form.price === "") {
      setSubmitError("Price is required");
      return;
    }

    if (form.inventory_type === "measurable" && !form.base_unit) {
      setSubmitError("Base unit is required");
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        variant: form.variant.trim(),
        brand: form.brand.trim(),
        inventory_type: form.inventory_type,
        base_unit: form.inventory_type === "measurable" ? form.base_unit : "",
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        low_stock_limit: Number(form.low_stock_limit || 5),
        selling_options:
          form.inventory_type === "measurable"
            ? form.selling_options
                .filter(
                  (option) =>
                    option.label.trim() &&
                    option.quantity !== "" &&
                    option.price !== "",
                )
                .map((option) => ({
                  label: option.label.trim(),
                  quantity: Number(option.quantity),
                  price: Number(option.price),
                }))
            : [],
      };

      let res;

      if (editingId) {
        res = await axios.post("http://localhost/backend/update_product.php", {
          id: editingId,
          ...payload,
        });
      } else {
        res = await axios.post(
          "http://localhost/backend/add_product.php",
          payload,
        );
      }

      if (res.data?.error) {
        setSubmitError(res.data.error);
        return;
      }

      setForm(emptyForm);
      setEditingId(null);
      setSubmitError("");
      fetchProducts();
    } catch (err) {
      console.log(err);
      setSubmitError("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await axios.post("http://localhost/backend/delete_product.php", {
        id,
        user_id: user.id,
      });

      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      variant: product.variant || "",
      brand: product.brand || "",
      inventory_type: product.inventory_type || "standard",
      base_unit: product.base_unit || "",
      price: product.price || "",
      stock: product.stock || "",
      low_stock_limit: product.low_stock_limit || 5,
      selling_options:
        product.selling_options?.map((option) => ({
          label: option.label,
          quantity: option.quantity,
          price: option.price,
        })) || [],
    });

    setEditingId(product.id);
    setSubmitError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSubmitError("");
  };

  const formatProductName = (product) => {
    return [product.name, product.variant, product.brand]
      .filter(Boolean)
      .join(" - ");
  };

  //////////////////////////////////////////////////
  // RESTOCK
  //////////////////////////////////////////////////

  const handleRestock = async () => {
    if (!restockQuantity) {
      return;
    }

    try {
      await axios.post("http://localhost/backend/restock_product.php", {
        id: restockProduct.id,

        user_id: user.id,

        quantity: Number(restockQuantity),
      });

      fetchProducts();

      setRestockProduct(null);

      setRestockQuantity("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-5">Products</h1>

      {/* FORM */}
      <div className="bg-white p-5 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Product Name */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Product Name *
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Variant */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Variant</label>

            <input
              type="text"
              name="variant"
              value={form.variant}
              onChange={handleChange}
              placeholder="Raw / Basmati / Zero Sugar"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Brand</label>

            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Tiger / Coca Cola"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Inventory Type */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Inventory Type
            </label>

            <select
              name="inventory_type"
              value={form.inventory_type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="standard">Standard Product</option>

              <option value="measurable">Measurable Product</option>
            </select>
          </div>

          {/* Base Unit */}
          {form.inventory_type === "measurable" && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Base Unit *
              </label>

              <select
                name="base_unit"
                value={form.base_unit}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Unit</option>

                <option value="kg">Kilogram (kg)</option>

                <option value="L">Litre (L)</option>
              </select>
            </div>
          )}

          {/* Price */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              {form.inventory_type === "measurable"
                ? "Price per 1 Unit *"
                : "Price *"}
            </label>

            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Stock</label>

            <input
              type="number"
              step="0.01"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Low Stock */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Low Stock Alert
            </label>

            <input
              type="number"
              step="0.01"
              name="low_stock_limit"
              value={form.low_stock_limit}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-black text-white px-5 py-2 rounded"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-300 px-5 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {submitError && (
        <p className="text-red-500 text-sm mb-4">{submitError}</p>
      )}

      {/* Product Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Type</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t align-top">
                {/* Product */}
                <td className="p-3">
                  <div className="font-medium">
                    {formatProductName(product)}
                  </div>
                </td>

                {/* Type */}
                <td className="p-3">
                  {product.inventory_type === "measurable"
                    ? "Measurable"
                    : "Standard"}
                </td>

                {/* Price */}
                <td className="p-3">
                  {product.inventory_type === "measurable"
                    ? `₹ ${product.price} / ${product.base_unit}`
                    : `₹ ${product.price}`}
                </td>

                {/* Stock */}
                <td className="p-3">
                  {Number(product.stock) === 0 ? (
                    <span className="text-red-500 font-medium">
                      Out of Stock ⚠️
                    </span>
                  ) : (
                    <div>
                      <div>
                        {product.stock}
                        {product.inventory_type === "measurable"
                          ? ` ${product.base_unit}`
                          : " pcs"}
                      </div>

                      {Number(product.stock) <=
                        Number(product.low_stock_limit) && (
                        <div className="text-orange-500 text-sm">
                          Low Stock ⚠️
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => setRestockProduct(product)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Restock
                    </button>

                    {cart.some((item) => item.product_id === product.id) ? (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">
                        Added To Cart
                      </div>
                    ) : product.has_suppliers ? (
                      <button
                        onClick={() => setModalProduct(product)}
                        className="bg-black text-white px-3 py-1 rounded"
                      >
                        Order Now
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed"
                      >
                        No Supplier
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RESTOCK MODAL */}

      {restockProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Restock Product</h2>

            <p className="text-gray-500 mb-5">
              {formatProductName(restockProduct)}
            </p>

            <input
              type="number"
              step="0.01"
              placeholder="Enter quantity"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              className="w-full border p-3 rounded-xl mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={handleRestock}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl"
              >
                Add Stock
              </button>

              <button
                onClick={() => setRestockProduct(null)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Products;
