import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  weight: string;
  quantity: number;
  image: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (productName: string, quantity: number) => void;
  removeItem: (productName: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

const CartContext = createContext<CartState>({
  items: [],
  loading: false,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getTotal: () => 0,
  getCount: () => 0,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productName === item.productName);
      if (existing) {
        return prev.map((i) =>
          i.productName === item.productName
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productName: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productName !== productName));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.productName === productName ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const removeItem = useCallback((productName: string) => {
    setItems((prev) => prev.filter((i) => i.productName !== productName));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  const getCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, loading, addItem, updateQuantity, removeItem, clearCart, getTotal, getCount }}
    >
      {children}
    </CartContext.Provider>
  );
}
