/**
 * Central product catalogue — the single source of truth for the Shop,
 * Product pages, Cart, Checkout and Mystic Assistant.
 * Add or edit products here only; every page and the assistant read from this list.
 * Set `image` to a photo URL once real photos are uploaded.
 */

export type CategorySlug = "earrings" | "rings" | "necklaces" | "bracelets" | "keychains";

export interface Category {
  slug: CategorySlug;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // INR
  category: CategorySlug;
  customizable: boolean;
  image?: string;
}

export const CATEGORIES: Category[] = [
  { slug: "earrings", name: "Earrings" },
  { slug: "rings", name: "Rings" },
  { slug: "necklaces", name: "Necklaces" },
  { slug: "bracelets", name: "Bracelets" },
  { slug: "keychains", name: "Keychains" },
];

export const PRODUCTS: Product[] = [
  { id: "10001", name: "Petal Glow Resin Ring", price: 69, category: "rings", customizable: false },
  { id: "10002", name: "Custom Initial Keychain", price: 69, category: "keychains", customizable: true },
  { id: "10003", name: "Flora Bloom Teardrop Dangles", price: 99, category: "earrings", customizable: false },
  { id: "10004", name: "Dual Daisy Prism Earrings", price: 99, category: "earrings", customizable: false },
  {
    id: "10005",
    name: "Personalized Triangle Resin Initial Necklace",
    price: 149,
    category: "necklaces",
    customizable: true,
  },
  { id: "10006", name: "Pearl Shimmer Name Keychain", price: 149, category: "keychains", customizable: true },
  { id: "10013", name: "Galaxy Glitz Oxidized Jhumkas", price: 249, category: "earrings", customizable: false },
  { id: "10019", name: "Gold Leaf Bracelet", price: 249, category: "bracelets", customizable: false },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function productsInCategory(slug: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function productPath(id: string): string {
  return `/product/${id}`;
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
