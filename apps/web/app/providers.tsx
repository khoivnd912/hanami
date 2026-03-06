"use client";

import { LangProvider } from "@/lib/lang-context";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer }   from "@/components/CartDrawer";

/**
 * Root client-side providers.
 * Placed inside the server layout so the layout itself stays a Server Component.
 * CartDrawer is mounted here so it is globally accessible from every page.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </LangProvider>
  );
}
