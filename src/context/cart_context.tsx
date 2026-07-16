"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addProduct: (productId: number, quantity: number) => void;
  getProductQuantity: (productId: number) => number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addProduct = useCallback(
    (productId: number, quantity: number) => {
      const normalizedQuantity = Math.max(1, Math.floor(quantity));

      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.productId === productId,
        );

        if (!existingItem) {
          return [
            ...currentItems,
            {
              productId,
              quantity: normalizedQuantity,
            },
          ];
        }

        return currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + normalizedQuantity,
              }
            : item,
        );
      });
    },
    [],
  );

  const getProductQuantity = useCallback(
    (productId: number) =>
      items.find((item) => item.productId === productId)?.quantity ?? 0,
    [items],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const contextValue = useMemo(
    () => ({
      items,
      totalQuantity,
      addProduct,
      getProductQuantity,
      clearCart,
    }),
    [
      items,
      totalQuantity,
      addProduct,
      getProductQuantity,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart должен использоваться внутри CartProvider",
    );
  }

  return context;
}
