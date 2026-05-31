import { useState } from "react";

import axios from "axios";

import {
  X,
  Mail,
  MessageCircle,
} from "lucide-react";

import {
  useProcurement,
} from "../../context/ProcurementContext";

function ProcurementSendModal({
  supplierId,
  supplier,
  onClose,
}) {

  const {
    markSupplierNotified,
  } = useProcurement();

  //////////////////////////////////////////////////
  // USER
  //////////////////////////////////////////////////

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  //////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////

  const [
    loading,
    setLoading,
  ] = useState(false);

  //////////////////////////////////////////////////
  // DATE & TIME
  //////////////////////////////////////////////////

  const currentDate =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  const currentTime =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  //////////////////////////////////////////////////
  // MESSAGE
  //////////////////////////////////////////////////

  const orderText = `

🏪 *${user?.shop_name}*

━━━━━━━━━━━━━━

📅 Date: ${currentDate}

⏰ Time: ${currentTime}

👤 Owner: ${user?.name || "N/A"}

📍 Address:
${user?.address || "No Address"}

📞 Phone:
${user?.phone || "No Phone"}

📧 Email:
${user?.email || "No Email"}

━━━━━━━━━━━━━━

📦 *RESTOCK ORDER REQUEST*

Hello *${supplier.supplier_name}*,

Please supply the following products:

${supplier.items
  .map(
    (item, index) =>
      `${index + 1}. *${item.product_name}*
Quantity: ${item.quantity}`
  )
  .join("\n\n")}

━━━━━━━━━━━━━━

Please confirm availability.

Thank you 🤝

*${user?.shop_name}*
`;

  //////////////////////////////////////////////////
  // WHATSAPP
  //////////////////////////////////////////////////

  const sendWhatsApp =
    () => {

    const phone =
      supplier.phone
        ?.replace(/\D/g, "");

    const url =
      `https://wa.me/91${phone}?text=${encodeURIComponent(orderText)}`;

    window.open(
      url,
      "_blank"
    );

    markSupplierNotified(
      supplierId
    );

    onClose();
  };

  //////////////////////////////////////////////////
  // EMAIL
  //////////////////////////////////////////////////

  const sendEmail =
    async () => {

    try {

      setLoading(true);

      const res =
        await axios.post(
          "http://localhost/backend/send_supplier_order.php",
          {
            email:
              supplier.email,

            supplier_name:
              supplier.supplier_name,

            items:
              supplier.items,

            shop_name:
              user?.shop_name,

            owner_name:
              user?.name,

            shop_phone:
              user?.phone,

            shop_email:
              user?.email,

            shop_address:
              user?.address,
          }
        );

      if (
        res.data.error
      ) {

        alert(
          res.data.error
        );

        return;
      }

      alert(
        "Email sent successfully"
      );

      markSupplierNotified(
        supplierId
      );

      onClose();

    } catch (err) {

      console.log(err);

      alert(
        "Failed to send email"
      );

    } finally {

      setLoading(false);
    }
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (

    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      {/* LOADING */}

      {loading && (

        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50">

          <div className="bg-white px-6 py-4 rounded-2xl shadow flex items-center gap-3">

            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>

            <span className="font-medium">

              Sending Email...

            </span>

          </div>

        </div>

      )}

      {/* MODAL */}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">

        {/* CLOSE */}

        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >

          <X size={20} />

        </button>

        {/* TITLE */}

        <h2 className="text-2xl font-bold mb-2">

          Send Supplier Order

        </h2>

        <p className="text-gray-500 mb-6">

          {supplier.supplier_name}

        </p>

        {/* SUMMARY */}

        <div className="bg-gray-100 rounded-2xl p-4 mb-6">

          <p className="font-semibold mb-3">

            Order Summary

          </p>

          <div className="space-y-2">

            {supplier.items.map(
              (
                item
              ) => (

                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >

                  <span>

                    {
                      item.product_name
                    }

                  </span>

                  <span>

                    {
                      item.quantity
                    }

                  </span>

                </div>
              )
            )}

          </div>

        </div>

        {/* ACTIONS */}

        <div className="space-y-3">

          {/* WHATSAPP */}

          <button
            onClick={
              sendWhatsApp
            }
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl transition font-medium disabled:opacity-50"
          >

            <MessageCircle
              size={20}
            />

            Send via WhatsApp

          </button>

          {/* EMAIL */}

          <button
            onClick={
              sendEmail
            }
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white py-3 rounded-2xl transition font-medium disabled:opacity-50"
          >

            <Mail
              size={20}
            />

            Send via Email

          </button>

        </div>

      </div>

    </div>
  );
}

export default ProcurementSendModal;