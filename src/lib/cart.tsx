import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getProduct, type Product } from "@/data/products";

export interface CartLine {
  id: string;
  qty: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  total: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "mystic-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

/** Resolve stored lines against the live catalogue so prices are always current. */
export function resolveCart(lines: CartLine[]): { items: CartItem[]; count: number; total: number } {
  const items: CartItem[] = [];
  for (const line of lines) {
    const product = getProduct(line.id);
    if (!product || line.qty < 1) continue;
    items.push({ product, qty: line.qty, lineTotal: product.price * line.qty });
  }
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.lineTotal, 0),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // ignore unreadable cart
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty < 1 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const resolved = resolveCart(lines);
    return { lines, ...resolved, add, setQty, remove, clear };
  }, [lines, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
