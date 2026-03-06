"use client";

import {
  createContext, useContext, useState,
  useCallback, useEffect,
  type ReactNode,
} from "react";
import { type CartProduct } from "./products";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CartItem { product: CartProduct; qty: number }

interface CartCtx {
  items:         CartItem[];
  cartOpen:      boolean;
  setCartOpen:   (v: boolean) => void;
  addToCart:     (product: CartProduct, qty: number) => void;
  updateQty:     (productId: string, qty: number) => void;
  removeFromCart:(productId: string) => void;
  clearCart:     () => void;
  cartCount:     number;
  cartTotal:     number;
}

// ─── Context ────────────────────────────────────────────────────────────────

const CartContext = createContext<CartCtx | null>(null);

const STORAGE_KEY = "hanami-cart-v1";

// ─── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items,     setItems]     = useState<CartItem[]>([]);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [hydrated,  setHydrated]  = useState(false);

  // Hydrate from localStorage (client-only, after mount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {/* ignore malformed storage */}
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addToCart = useCallback((product: CartProduct, qty: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty }];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((productId: string, newQty: number) => {
    if (newQty < 1) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => i.product.id === productId ? { ...i, qty: newQty } : i)
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items, cartOpen, setCartOpen,
        addToCart, updateQty, removeFromCart, clearCart,
        cartCount, cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
