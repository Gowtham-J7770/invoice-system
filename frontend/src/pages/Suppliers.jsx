import { useEffect, useState } from "react";

import axios from "axios";

import { Trash2, Pencil, Plus, X } from "lucide-react";

function Suppliers() {
  const user = JSON.parse(localStorage.getItem("user"));

  //////////////////////////////////////////////////
  // STATES
  //////////////////////////////////////////////////

  const emptyForm = {
    name: "",
    phone: "",
    email: "",
  };

  const [form, setForm] = useState(emptyForm);

  const [suppliers, setSuppliers] = useState([]);

  const [products, setProducts] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");

  const [selectedProduct, setSelectedProduct] = useState({});

  const [supplierProducts, setSupplierProducts] = useState({});

  //////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////

  useEffect(() => {
    fetchSuppliers();

    fetchProducts();
  }, []);

  //////////////////////////////////////////////////
  // FETCH SUPPLIERS
  //////////////////////////////////////////////////

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(
        `http://localhost/backend/get_suppliers.php?user_id=${user.id}`,
      );

      setSuppliers(res.data);

      //////////////////////////////////////////////////
      // FETCH PRODUCTS FOR EACH SUPPLIER
      //////////////////////////////////////////////////

      res.data.forEach((supplier) => {
        fetchSupplierProducts(supplier.id);
      });
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // FETCH PRODUCTS
  //////////////////////////////////////////////////

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

  //////////////////////////////////////////////////
  // FETCH SUPPLIER PRODUCTS
  //////////////////////////////////////////////////

  const fetchSupplierProducts = async (supplierId) => {
    try {
      const res = await axios.get(
        `http://localhost/backend/get_supplier_products.php?supplier_id=${supplierId}`,
      );

      setSupplierProducts((prev) => ({
        ...prev,

        [supplierId]: res.data,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // HANDLE CHANGE
  //////////////////////////////////////////////////

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  //////////////////////////////////////////////////
  // SUBMIT
  //////////////////////////////////////////////////

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const payload = {
        ...form,

        id: editingId,

        user_id: user.id,
      };

      let res;

      if (editingId) {
        res = await axios.post(
          "http://localhost/backend/update_supplier.php",
          payload,
        );
      } else {
        res = await axios.post(
          "http://localhost/backend/add_supplier.php",
          payload,
        );
      }

      //////////////////////////////////////////////////
      // BACKEND ERROR
      //////////////////////////////////////////////////

      if (res.data.error) {
        setMessage(res.data.error);

        return;
      }

      //////////////////////////////////////////////////
      // SUCCESS
      //////////////////////////////////////////////////

      setMessage("");

      setForm(emptyForm);

      setEditingId(null);

      fetchSuppliers();
    } catch (err) {
      console.log(err);

      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  //////////////////////////////////////////////////
  // EDIT
  //////////////////////////////////////////////////

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);

    setForm({
      name: supplier.name,

      phone: supplier.phone,

      email: supplier.email,
    });

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  //////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete supplier?");

    if (!ok) return;

    try {
      await axios.post("http://localhost/backend/delete_supplier.php", {
        id,

        user_id: user.id,
      });

      fetchSuppliers();
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // ADD PRODUCT
  //////////////////////////////////////////////////

  const addProduct = async (supplierId) => {
    const productId = selectedProduct[supplierId];

    if (!productId) return;

    try {
      await axios.post("http://localhost/backend/add_supplier_product.php", {
        supplier_id: supplierId,

        product_id: productId,
      });

      setSelectedProduct((prev) => ({
        ...prev,

        [supplierId]: "",
      }));

      fetchSupplierProducts(supplierId);
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // REMOVE PRODUCT
  //////////////////////////////////////////////////

  const removeProduct = async (supplierId, productId) => {
    try {
      await axios.post("http://localhost/backend/remove_supplier_product.php", {
        supplier_id: supplierId,

        product_id: productId,
      });

      fetchSupplierProducts(supplierId);
    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Suppliers</h1>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-xl shadow mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Supplier Name"
            value={form.name}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-3 rounded"
          />
        </div>

        {message && <p className="text-red-500 mt-3">{message}</p>}

        <button
          type="submit"
          className="mt-4 bg-black text-white px-5 py-3 rounded-lg"
        >
          {editingId ? "Update Supplier" : "Add Supplier"}
        </button>
      </form>

      {/* SUPPLIERS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {suppliers.map((supplier) => {
          const suppliedProducts = supplierProducts[supplier.id] || [];

          return (
            <div key={supplier.id} className="bg-white rounded-xl shadow p-5">
              {/* TOP */}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{supplier.name}</h2>

                  <p className="text-gray-500 text-sm mt-1">{supplier.phone}</p>

                  <p className="text-gray-500 text-sm">{supplier.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="p-2 bg-gray-100 rounded"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="p-2 bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* ADD PRODUCT */}

              <div className="flex gap-2 mb-4">
                <select
                  value={selectedProduct[supplier.id] || ""}
                  onChange={(e) =>
                    setSelectedProduct((prev) => ({
                      ...prev,

                      [supplier.id]: e.target.value,
                    }))
                  }
                  className="flex-1 border p-2 rounded"
                >
                  <option value="">Select Product</option>

                  {products.map((product) => {
                    const alreadyAdded = suppliedProducts.some(
                      (p) => String(p.id) === String(product.id),
                    );

                    return (
                      <option
                        key={product.id}
                        value={product.id}
                        disabled={alreadyAdded}
                      >
                        {product.name}

                        {alreadyAdded ? " ✓ Added" : ""}
                      </option>
                    );
                  })}
                </select>

                <button
                  onClick={() => addProduct(supplier.id)}
                  className="bg-black text-white px-4 rounded"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* PRODUCTS */}

              <div className="space-y-2">
                {suppliedProducts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No products linked</p>
                ) : (
                  suppliedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      <span>{product.name}</span>

                      <button
                        onClick={() => removeProduct(supplier.id, product.id)}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Suppliers;
