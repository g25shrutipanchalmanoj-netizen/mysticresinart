import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { ProductImage } from "@/components/site/ProductImage";
import { CATEGORIES, formatPrice, productsInCategory } from "@/data/products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Mystic Resin Art" },
      { name: "description", content: "Shop resin earrings, rings, necklaces, bracelets and keychains by category." },
      { property: "og:title", content: "Categories — Mystic Resin Art" },
      { property: "og:description", content: "Find handmade resin pieces by category." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Categories,
});

function Categories() {
  return (
    <>
      <PageHeader eyebrow="Browse" title="Categories" />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const items = productsInCategory(c.slug);
          const from = items.length ? Math.min(...items.map((p) => p.price)) : null;
          return (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3]">{items[0] ? <ProductImage product={items[0]} /> : <div className="bg-tile h-full" />}</div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-2xl font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">{items.length} pieces</p>
                </div>
                {from !== null && <span className="text-sm font-semibold">from {formatPrice(from)}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
