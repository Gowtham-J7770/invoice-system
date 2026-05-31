import { useState } from "react";

import {
  ShoppingCart,
  Trash2,
  Send,
  X,
} from "lucide-react";

import ProcurementSendModal from "../components/layout/ProcurementSendModal";

import {
  useProcurement,
} from "../context/ProcurementContext";

function Procurement() {

  const {
    cart,
    removeFromCart,
    clearSupplierCart,
  } = useProcurement();

  //////////////////////////////////////////////////
  // SEND MODAL
  //////////////////////////////////////////////////

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState(null);

  //////////////////////////////////////////////////
  // GROUP BY SUPPLIER
  //////////////////////////////////////////////////

  const groupedCart =
    cart.reduce(
      (acc, item) => {

        const supplierId =
          item.supplier_id;

        if (
          !acc[supplierId]
        ) {

          acc[supplierId] = {

            supplier_name:
              item.supplier_name,

            phone:
              item.supplier_phone,

            email:
              item.supplier_email,

            items: [],
          };
        }

        acc[
          supplierId
        ].items.push(
          item
        );

        return acc;

      },
      {}
    );

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}

      <div className="flex items-center gap-3 mb-8">

        <div className="bg-black text-white p-3 rounded-2xl">

          <ShoppingCart
            size={24}
          />

        </div>

        <div>

          <h1 className="text-3xl font-bold">

            Suppliers Cart

          </h1>

          <p className="text-gray-500 text-sm mt-1">

            Manage supplier restock orders

          </p>

        </div>

      </div>

      {/* EMPTY */}

      {cart.length === 0 ? (

        <div className="bg-white rounded-2xl shadow p-10 text-center">

          <ShoppingCart
            size={40}
            className="mx-auto text-gray-300 mb-4"
          />

          <h2 className="text-xl font-semibold text-gray-700">

            Cart is empty

          </h2>

          <p className="text-gray-500 mt-2">

            Add products from dashboard

          </p>

        </div>

      ) : (

        <div className="space-y-6">

          {Object.entries(
            groupedCart
          ).map(
            ([
              supplierId,
              supplier,
            ]) => (

              <div
                key={
                  supplierId
                }
                className="bg-white rounded-2xl shadow p-5"
              >

                {/* SUPPLIER HEADER */}

                <div className="flex justify-between items-center mb-5">

                  <div>

                    <h2 className="text-xl font-bold text-gray-800">

                      {
                        supplier.supplier_name
                      }

                    </h2>

                    <p className="text-sm text-gray-500 mt-1">

                      {
                        supplier.items
                          .length
                      }{" "}
                      product
                      {
                        supplier.items
                          .length > 1
                          ? "s"
                          : ""
                      }

                    </p>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-3">

                    {/* CLEAR */}

                    <button
                      onClick={() =>
                        clearSupplierCart(
                          supplierId
                        )
                      }
                      className="flex items-center gap-2 border border-red-200 text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                    >

                      <X
                        size={16}
                      />

                      Clear

                    </button>

                    {/* SEND */}

                    <button
                      onClick={() =>
                        setSelectedSupplier({
                          supplierId,
                          supplier,
                        })
                      }
                      className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
                    >

                      <Send
                        size={16}
                      />

                      Send Order

                    </button>

                  </div>

                </div>

                {/* ITEMS */}

                <div className="space-y-3">

                  {supplier.items.map(
                    (
                      item
                    ) => (

                      <div
                        key={
                          item.id
                        }
                        className="border rounded-xl p-4 flex justify-between items-center"
                      >

                        {/* LEFT */}

                        <div>

                          <p className="font-medium text-gray-800">

                            {
                              item.product_name
                            }

                          </p>

                          <p className="text-sm text-gray-500 mt-1">

                            Quantity:
                            {" "}
                            {
                              item.quantity
                            }

                          </p>

                        </div>

                        {/* REMOVE */}

                        <button
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                          className="text-red-500 hover:text-red-700 transition"
                        >

                          <Trash2
                            size={18}
                          />

                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}

      {/* SEND MODAL */}

      {selectedSupplier && (

        <ProcurementSendModal
          supplierId={
            selectedSupplier.supplierId
          }
          supplier={
            selectedSupplier.supplier
          }
          onClose={() =>
            setSelectedSupplier(
              null
            )
          }
        />

      )}

    </div>
  );
}

export default Procurement;