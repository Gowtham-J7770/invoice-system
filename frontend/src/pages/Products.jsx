import { useState, useEffect } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
  });

  const [editingId, setEditingId] = useState(null); // 🔥 FIX
  const hasInventory = true;
  // 🔥 FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost/backend/get_products.php");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 ADD / UPDATE PRODUCT
  const handleSubmit = async () => {
    if (!form.name || !form.price) return;

    try {
      const payload = {
        name: form.name,
        price: form.price,
        stock: hasInventory
          ? form.stock === ""
            ? null
            : Number(form.stock)
          : null,
        hasInventory: hasInventory,
      };

      if (editingId) {
        await axios.post("http://localhost/backend/update_product.php", {
          id: editingId,
          ...payload,
        });
        setEditingId(null);
      } else {
        await axios.post("http://localhost/backend/add_product.php", payload);
      }

      fetchProducts();

      setForm({
        name: "",
        price: "",
        stock: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    try {
      await axios.post("http://localhost/backend/delete_product.php", { id });
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-5">Products</h1>

      {/* 🔥 ADD / EDIT FORM */}
      <div className="bg-white p-4 rounded mb-6 flex gap-4 items-end">
        {/* NAME */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        {/* PRICE */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        {/* STOCK */}
        {hasInventory && (
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* 🔥 PRODUCT TABLE */}
      <div className="bg-white rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              {hasInventory && <th className="p-3">Stock</th>}
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">₹ {p.price}</td>
                {hasInventory && (
                  <td className="p-3">
                    {p.stock === null
                      ? "—"
                      : p.stock === 0
                        ? "Out ⚠️"
                        : p.stock}
                  </td>
                )}

                <td className="p-3 flex gap-2">
                  {/* EDIT */}
                  <button
                    onClick={() => {
                      setForm({
                        name: p.name,
                        price: p.price,
                        stock: p.stock ?? "",
                      });
                      setEditingId(p.id);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
