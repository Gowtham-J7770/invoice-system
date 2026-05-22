import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ProcurementContext =
  createContext();

export function ProcurementProvider({
  children,
}) {

  //////////////////////////////////////////////////
  // CART
  //////////////////////////////////////////////////

  const [cart,
    setCart] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "procurement_cart"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  //////////////////////////////////////////////////
  // NOTIFIED PRODUCTS
  //////////////////////////////////////////////////

  const [
    notifiedProducts,
    setNotifiedProducts,
  ] = useState(() => {

    const saved =
      localStorage.getItem(
        "notified_products"
      );

    return saved
      ? JSON.parse(saved)
      : [];
  });

  //////////////////////////////////////////////////
  // SAVE CART
  //////////////////////////////////////////////////

  useEffect(() => {

    localStorage.setItem(
      "procurement_cart",

      JSON.stringify(cart)
    );

  }, [cart]);

  //////////////////////////////////////////////////
  // SAVE NOTIFIED
  //////////////////////////////////////////////////

  useEffect(() => {

    localStorage.setItem(
      "notified_products",

      JSON.stringify(
        notifiedProducts
      )
    );

  }, [notifiedProducts]);

  //////////////////////////////////////////////////
  // ADD TO CART
  //////////////////////////////////////////////////

  const addToCart =
    (item) => {

    const exists =
      cart.some(
        (p) =>
          String(
            p.product_id
          ) ===
          String(
            item.product_id
          )
      );

    if (exists) return;

    setCart([
      ...cart,
      item,
    ]);
  };

  //////////////////////////////////////////////////
  // REMOVE ITEM
  //////////////////////////////////////////////////

  const removeFromCart =
    (id) => {

    setCart(
      cart.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  //////////////////////////////////////////////////
  // CLEAR SUPPLIER GROUP
  //////////////////////////////////////////////////

  const clearSupplierCart =
    (
      supplier_id
    ) => {

    setCart(
      cart.filter(
        (item) =>
          String(
            item.supplier_id
          ) !==
          String(
            supplier_id
          )
      )
    );
  };

  //////////////////////////////////////////////////
  // MARK SUPPLIER NOTIFIED
  //////////////////////////////////////////////////

  const markSupplierNotified =
    (
      supplier_id
    ) => {

    const supplierItems =
      cart.filter(
        (item) =>
          String(
            item.supplier_id
          ) ===
          String(
            supplier_id
          )
      );

    const productIds =
      supplierItems.map(
        (item) =>
          item.product_id
      );

    setNotifiedProducts(
      (prev) => [

        ...new Set([
          ...prev,
          ...productIds,
        ]),
      ]
    );

    clearSupplierCart(
      supplier_id
    );
  };

  //////////////////////////////////////////////////
  // REMOVE NOTIFIED PRODUCT
  //////////////////////////////////////////////////

  const removeNotifiedProduct =
    (
      product_id
    ) => {

    setNotifiedProducts(
      (
        prev
      ) =>
        prev.filter(
          (id) =>
            String(id) !==
            String(
              product_id
            )
        )
    );
  };

  return (

    <ProcurementContext.Provider
      value={{

        cart,

        notifiedProducts,

        addToCart,

        removeFromCart,

        clearSupplierCart,

        markSupplierNotified,

        removeNotifiedProduct,
      }}
    >

      {children}

    </ProcurementContext.Provider>
  );
}

export const useProcurement =
  () =>
    useContext(
      ProcurementContext
    );