import { CATEGORIES, formatPrice, type Product } from "@/data/products";

import type { SearchFilters } from "./types";

export function hasFilters(f: SearchFilters | undefined): boolean {
  if (!f) return false;
  return Boolean(
    f.category ||
      f.customizableOnly ||
      f.minPrice !== undefined ||
      f.maxPrice !== undefined ||
      f.aroundPrice !== undefined,
  );
}

/** Filter the real catalogue. Conditions combine with AND. */
export function searchProducts(catalog: Product[], f: SearchFilters, limit = 6): Product[] {
  let list = catalog.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.customizableOnly && !p.customizable) return false;
    if (f.minPrice !== undefined && p.price < f.minPrice) return false;
    if (f.maxPrice !== undefined && p.price > f.maxPrice) return false;
    return true;
  });

  if (f.aroundPrice !== undefined) {
    const target = f.aroundPrice;
    const near = list.filter((p) => Math.abs(p.price - target) <= Math.max(50, target * 0.4));
    list = (near.length ? near : list).sort(
      (a, b) => Math.abs(a.price - target) - Math.abs(b.price - target),
    );
    return list.slice(0, near.length ? limit : 3);
  }

  return list.sort((a, b) => a.price - b.price).slice(0, limit);
}

/** Closest alternatives when nothing matches: same category first, then nearest price. */
export function closestProducts(catalog: Product[], f: SearchFilters, limit = 3): Product[] {
  const target = f.aroundPrice ?? f.maxPrice ?? f.minPrice;
  let pool = f.category ? catalog.filter((p) => p.category === f.category) : catalog;
  if (f.customizableOnly) {
    const custom = pool.filter((p) => p.customizable);
    if (custom.length) pool = custom;
  }
  if (!pool.length) pool = catalog;
  const sorted = [...pool].sort((a, b) =>
    target === undefined ? a.price - b.price : Math.abs(a.price - target) - Math.abs(b.price - target),
  );
  return sorted.slice(0, limit);
}

export function describeFilters(f: SearchFilters, gift = false): string {
  const cat = f.category ? CATEGORIES.find((c) => c.slug === f.category)?.name.toLowerCase() : undefined;
  let noun = cat ?? (gift ? "gift ideas" : "products");
  if (f.customizableOnly) noun = cat ? `personalisable ${cat}` : "personalisable products";
  let price = "";
  if (f.minPrice !== undefined && f.maxPrice !== undefined)
    price = ` between ${formatPrice(f.minPrice)} and ${formatPrice(f.maxPrice)}`;
  else if (f.maxPrice !== undefined) price = ` under ${formatPrice(f.maxPrice)}`;
  else if (f.minPrice !== undefined) price = ` above ${formatPrice(f.minPrice)}`;
  else if (f.aroundPrice !== undefined) price = ` around ${formatPrice(f.aroundPrice)}`;
  return `${noun}${price}`;
}

/** Reasons use only facts present in the product data. */
export function recommendationReasons(products: Product[], gift: boolean): Record<string, string> {
  const reasons: Record<string, string> = {};
  for (const p of products) {
    if (p.customizable) reasons[p.id] = gift ? "A thoughtful gift — it can be personalised." : "Can be personalised.";
  }
  return reasons;
}
