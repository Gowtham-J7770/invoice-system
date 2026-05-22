import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  X,
} from "lucide-react";

import {
  useProcurement,
} from "../../context/ProcurementContext";

function ProcurementModal({
  product,
  onClose,
}) {

  const {
    addToCart,
  } = useProcurement();

  const [suppliers,
    setSuppliers] =
    useState([]);

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState("");

  const [quantity,
    setQuantity] =
    useState(
      Number(
        product.low_stock_limit
      ) * 5
    );

  //////////////////////////////////////////////////
  // LOAD SUPPLIERS
  //////////////////////////////////////////////////

  useEffect(() => {

    fetchSuppliers();

  }, []);

  const fetchSuppliers =
    async () => {

    try {

      const res =
        await axios.get(
          `http://localhost/backend/get_product_suppliers.php?product_id=${product.id}`
        );

      setSuppliers(
        res.data || []
      );

    } catch (err) {

      console.log(err);
    }
  };

  //////////////////////////////////////////////////
  // ADD
  //////////////////////////////////////////////////

  const handleAdd =
    () => {

    if (
      !selectedSupplier
    ) {
      return;
    }

    const supplier =
      suppliers.find(
        (s) =>
          String(s.id) ===
          String(
            selectedSupplier
          )
      );

    addToCart({

      id: Date.now(),

      product_id:
        product.id,

      product_name:
        product.name,

      supplier_id:
        supplier.id,

      supplier_name:
        supplier.name,

      quantity,
    });

    onClose();
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (

    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">

        {/* CLOSE */}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >

          <X size={20} />

        </button>

        {/* TITLE */}

        <h2 className="text-2xl font-bold mb-1">

          Restock Product

        </h2>

        <p className="text-gray-500 mb-6">

          {product.name}

        </p>

        {/* FORM */}

        <div className="space-y-4">

          {/* SUPPLIER */}

          <div>

            <label className="block text-sm font-medium mb-2">

              Supplier

            </label>

            <select
              value={
                selectedSupplier
              }
              onChange={(e) =>
                setSelectedSupplier(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-xl"
            >

              <option value="">
                Select Supplier
              </option>

              {suppliers.map(
                (
                  supplier
                ) => (

                  <option
                    key={
                      supplier.id
                    }
                    value={
                      supplier.id
                    }
                  >

                    {
                      supplier.name
                    }

                  </option>
                )
              )}

            </select>

          </div>

          {/* QUANTITY */}

          <div>

            <label className="block text-sm font-medium mb-2">

              Quantity

            </label>

            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-xl"
            />

          </div>

          {/* BUTTON */}

          <button
            onClick={
              handleAdd
            }
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
          >

            Add To Cart

          </button>

        </div>

      </div>

    </div>
  );
}

export default ProcurementModal;